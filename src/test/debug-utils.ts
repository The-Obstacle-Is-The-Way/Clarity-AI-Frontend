import { vi } from 'vitest';

// Color-coded debug logger for test environments
export const testLogger = {
  component: (component: string, msg: string, data?: any) => 
    console.log(`\x1b[36m[COMPONENT:${component}]\x1b[0m ${msg}`, data || ''),
  
  state: (component: string, stateName: string, value: any) => 
    console.log(`\x1b[32m[STATE:${component}]\x1b[0m ${stateName} = `, value),
  
  mock: (service: string, method: string, args?: any[], returnValue?: any) => 
    console.log(`\x1b[33m[MOCK:${service}.${method}]\x1b[0m called with:`, 
      args || '', returnValue ? `\nreturning:` : '', returnValue || ''),
  
  test: (testName: string, phase: string, info?: any) => 
    console.log(`\x1b[35m[TEST:${testName}]\x1b[0m ${phase}`, info || ''),
  
  dom: (msg: string) => {
    console.log(`\x1b[34m[DOM]\x1b[0m ${msg}`);
  },
  
  error: (source: string, error: any) => 
    console.error(`\x1b[31m[ERROR:${source}]\x1b[0m`, error)
};

// DOM snapshot logger
export const logDOMState = (screen: any, element?: HTMLElement) => {
  const container = element || document.body;
  console.log('\n\x1b[34m[DOM SNAPSHOT]\x1b[0m');
  console.log(container.innerHTML);
  
  if (screen) {
    try {
      const button = screen.queryByRole('button');
      if (button) {
        console.log('\n\x1b[34m[BUTTON STATE]\x1b[0m', {
          text: button.textContent,
          disabled: button.disabled,
          attributes: Array.from(button.attributes).map(attr => 
            `${attr.name}="${attr.value}"`).join(', ')
        });
      }
    } catch (e) {
      console.error('Error logging button state:', e);
    }
  }
};

// Mock authService with detailed logging
export const createAuthServiceMock = () => ({
  login: vi.fn().mockImplementation((email, password) => {
    testLogger.mock('authService', 'login', [email, password]);
    
    // Log before resolving
    testLogger.mock('authService', 'login', null, { token: 'fake-token' });
    
    // Return a promise that resolves after a short delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ token: 'fake-token' });
      }, 50); // Small delay to ensure state updates can be observed
    });
  }),
  
  // Add other methods as needed
  getCurrentUser: vi.fn().mockImplementation(() => {
    testLogger.mock('authService', 'getCurrentUser');
    return null;
  })
});

// Time the execution of async operations
export const timeExecution = async (
  name: string, 
  fn: () => Promise<any>
): Promise<any> => {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    console.log(`\x1b[35m[TIMING]\x1b[0m ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`\x1b[31m[TIMING ERROR]\x1b[0m ${name}: ${(end - start).toFixed(2)}ms`);
    throw error;
  }
}; 