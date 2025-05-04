# Product Requirements Document: SKIPPED TESTS RESOLUTION

## 1. EXECUTIVE SUMMARY

This document outlines a comprehensive strategy to address the 17 skipped tests in the Clarity-AI-Frontend mental health digital twin platform. Resolving these tests is critical for ensuring proper test coverage, production readiness, and long-term maintainability of the codebase. The document provides detailed analysis of each test category, specific technical approaches to resolve the issues, and an implementation plan with clear checkpoints.

## 2. PROBLEM ANALYSIS

### 2.1 Current Situation

The Clarity-AI-Frontend codebase currently contains 17 skipped tests across three distinct categories:

1. **AuthService Tests (13 tests)**: In `src/infrastructure/auth/AuthService.enhanced.test.ts`
   - Issues with mocking complex dependencies
   - Type errors with localStorage mocking
   - Challenges with asynchronous timing in token refresh tests
   - Difficulties testing private methods

2. **ThemeProvider Test (1 test)**: In `src/application/providers/ThemeProvider.enhanced.test.tsx`
   - Timing issues between localStorage updates and React state changes
   - Inconsistent application of theme classes in test environment

3. **Three.js Visualization Tests (3 tests)**: In `src/presentation/molecules/visualization/BrainModelVisualization.test.tsx`
   - WebGL context limitations in test environments
   - Challenges testing GPU-accelerated components
   - Difficulty validating visual output programmatically

### 2.2 Technical Root Cause Analysis

#### 2.2.1 AuthService Tests

The primary challenges with AuthService tests stem from:

- **Complex State Management**: Token refresh logic involves multiple state changes
- **Browser API Dependencies**: Heavy reliance on localStorage, fetch, and timers
- **TypeScript Limitations**: Type errors when mocking browser APIs
- **Tight Coupling**: The AuthService class is tightly coupled to its dependencies

#### 2.2.2 ThemeProvider Test

The ThemeProvider test issues stem from:

- **Race Conditions**: Competing React effects and DOM updates
- **Implicit Dependencies**: Hidden reliance on browser APIs (localStorage)
- **State Propagation Timing**: Inconsistent timing between state changes and DOM updates

#### 2.2.3 Three.js Visualization Tests

The Three.js component testing challenges include:

- **Environmental Limitations**: jsdom lacks WebGL support
- **Hardware Dependencies**: Three.js components require GPU acceleration
- **Visual Validation**: Traditional assertions can't verify visual correctness
- **Performance Constraints**: 3D rendering is resource-intensive in test environments

## 3. SOLUTION REQUIREMENTS

### 3.1 General Requirements

- All fixed tests must pass consistently in CI/CD environments
- Fixed tests must maintain high code coverage for critical paths
- Solutions must be compatible with the existing Vitest testing framework
- Implementation should follow established project patterns and code style

### 3.2 Technical Requirements

#### 3.2.1 AuthService Test Requirements

- Create a test-specific implementation of AuthApiClient
- Implement reliable localStorage mocking strategy
- Create mechanisms to control timer/async behavior
- Ensure type safety throughout test implementations

#### 3.2.2 ThemeProvider Test Requirements 

- Implement reliable control over React effect timing
- Ensure consistent localStorage state between tests
- Add robust assertions for DOM state changes
- Prevent test pollution between runs

#### 3.2.3 Three.js Visualization Test Requirements

- Implement appropriate test strategies for 3D components
- Create mocks for Three.js primitives
- Establish clear boundaries between visual and logical tests
- Document limitations and alternative testing approaches

## 4. IMPLEMENTATION STRATEGY

### 4.1 AuthService Tests Resolution

#### Approach 1: Test Harness with Dependency Injection

1. Create `AuthServiceTestHarness.ts` utility:
   ```typescript
   // Test harness to simplify AuthService testing
   export class AuthServiceTestHarness {
     mockApiClient = {
       login: vi.fn(),
       refreshToken: vi.fn(),
       getCurrentUser: vi.fn(),
       logout: vi.fn()
     };
     
     // Mock localStorage implementation
     mockStorage = {
       getItem: vi.fn(),
       setItem: vi.fn(),
       removeItem: vi.fn(),
       clear: vi.fn()
     };
     
     // Pre-configured instance with mocks injected
     authService: AuthService;
     
     constructor() {
       // Setup the test environment
       this.setupLocalStorageMock();
       this.authService = new AuthService(this.mockApiClient);
     }
     
     // Helper to simulate successful login
     simulateSuccessfulLogin(user: User, tokens: AuthTokens) {
       this.mockStorage.getItem.mockReturnValue(JSON.stringify(tokens));
       this.mockApiClient.getCurrentUser.mockResolvedValue(user);
     }
     
     // Additional helper methods...
     
     private setupLocalStorageMock() {
       // Setup localStorage mock implementation
       Object.defineProperty(window, 'localStorage', {
         value: this.mockStorage,
       });
     }
   }
   ```

2. Refactor tests to use the test harness:
   ```typescript
   describe('AuthService', () => {
     let harness: AuthServiceTestHarness;
     
     beforeEach(() => {
       harness = new AuthServiceTestHarness();
       vi.useFakeTimers();
     });
     
     afterEach(() => {
       vi.restoreAllMocks();
       vi.useRealTimers();
     });
     
     it('should attempt to refresh token when it has expired', async () => {
       // Setup with expired tokens
       const expiredTokens = { accessToken: 'expired', refreshToken: 'valid', expiresAt: Date.now() - 1000 };
       harness.simulateStoredTokens(expiredTokens);
       
       // Setup refresh response
       const newTokens = { accessToken: 'new-token', refreshToken: 'new-refresh', expiresAt: Date.now() + 3600000 };
       harness.mockApiClient.refreshToken.mockResolvedValue(newTokens);
       
       // Initialize auth
       await harness.authService.initializeAuth();
       
       // Verify refresh was called
       expect(harness.mockApiClient.refreshToken).toHaveBeenCalledWith('valid');
       expect(harness.mockStorage.setItem).toHaveBeenCalled();
     });
     
     // Additional tests...
   });
   ```

#### Approach 2: Testable Subclass

Create a testable subclass that exposes protected methods:

```typescript
// TestableAuthService.ts
export class TestableAuthService extends AuthService {
  // Expose protected methods for testing
  public exposeCheckTokenExpiration(tokens: AuthTokens): boolean {
    return this.checkTokenExpiration(tokens);
  }
  
  public exposeRefreshAuthToken(refreshToken: string): Promise<AuthTokens> {
    return this.refreshAuthToken(refreshToken);
  }
}
```

### 4.2 ThemeProvider Test Resolution

#### Approach: Enhanced React Testing Setup

1. Create a dedicated setup for theme tests:
   ```typescript
   // setup-theme-tests.ts
   import { act } from '@testing-library/react';
   
   export function setupThemeTest() {
     // Clear DOM state
     document.documentElement.classList.remove('light', 'dark');
     
     // Clear localStorage
     window.localStorage.clear();
     
     // Return helper functions
     return {
       // Wait for theme to be applied with longer timeout
       async waitForThemeChange(expectedTheme: 'light' | 'dark') {
         await act(async () => {
           await new Promise(resolve => setTimeout(resolve, 100));
         });
         
         return document.documentElement.classList.contains(expectedTheme);
       }
     };
   }
   ```

2. Update the skipped test:
   ```typescript
   it('reads from localStorage if a theme is stored', async () => {
     const { waitForThemeChange } = setupThemeTest();
     
     // Setup localStorage with dark theme before rendering
     localStorage.setItem('ui-theme', 'dark');
     
     // Render with light as default
     render(
       <ThemeProvider defaultTheme="light" storageKey="ui-theme">
         <div>Test</div>
       </ThemeProvider>
     );
     
     // Wait for theme to be applied
     const isDarkTheme = await waitForThemeChange('dark');
     expect(isDarkTheme).toBe(true);
   });
   ```

### 4.3 Three.js Visualization Tests Resolution

For Three.js components, we'll implement a multi-layered strategy:

#### Approach 1: Separate Logic from Rendering

1. Refactor components to separate logic from rendering:
   ```typescript
   // Before: All mixed together
   function BrainVisualization() {
     // Logic and rendering mixed
   }
   
   // After: Separated
   function useBrainVisualizationLogic() {
     // Pure logic that can be tested
     return { data, actions };
   }
   
   function BrainVisualization() {
     const { data, actions } = useBrainVisualizationLogic();
     // Rendering with Three.js
   }
   ```

2. Test the logic hooks independently:
   ```typescript
   describe('useBrainVisualizationLogic', () => {
     it('should process brain regions correctly', () => {
       const { result } = renderHook(() => useBrainVisualizationLogic({
         initialRegions: mockBrainRegions
       }));
       
       expect(result.current.processedRegions).toEqual(expectedProcessedRegions);
     });
   });
   ```

#### Approach 2: Use React Three Test Renderer

For components that need Three.js context, use the specialized test renderer:

```typescript
import ReactThreeTestRenderer from '@react-three/test-renderer';

describe('BrainRegion component', () => {
  it('renders with correct scale', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <BrainRegion region={mockRegion} />
    );
    
    const mesh = renderer.scene.children[0];
    expect(mesh.props.scale.x).toBeCloseTo(1.0);
  });
});
```

## 5. IMPLEMENTATION PLAN AND TIMELINE

### 5.1 Phase 1: Setup and Foundation (Week 1)

- [ ] Create test utilities and harnesses
- [ ] Document existing test issues in more detail
- [ ] Setup enhanced mocking capabilities
- [ ] Install additional testing libraries (@react-three/test-renderer)

### 5.2 Phase 2: AuthService Tests (Week 2)

- [ ] Implement AuthServiceTestHarness
- [ ] Fix token refresh tests (5 tests)
- [ ] Fix login/logout flow tests (4 tests)
- [ ] Fix error handling tests (4 tests)

### 5.3 Phase 3: ThemeProvider Test (Week 2)

- [ ] Create theme test setup helpers
- [ ] Fix localStorage integration test
- [ ] Add additional theme change tests for completeness

### 5.4 Phase 4: Three.js Component Tests (Week 3)

- [ ] Separate logic from Three.js components
- [ ] Implement tests for extracted logic
- [ ] Create basic structure tests with test renderer
- [ ] Document visual testing approach

### 5.5 Phase 5: Integration and Documentation (Week 4)

- [ ] Ensure all tests pass in CI/CD
- [ ] Create documentation for test patterns
- [ ] Update SKIPPED_TESTS.md with resolutions
- [ ] Create PR and conduct code review

## 6. SUCCESS CRITERIA CHECKLIST

- [ ] All 17 previously skipped tests now pass consistently
- [ ] Test coverage meets or exceeds project requirements (>80%)
- [ ] Tests run in under 60 seconds in CI environment
- [ ] Documentation is updated with new testing patterns
- [ ] Code review approvals from 2+ team members
- [ ] Zero regressions in existing functionality

## 7. RISKS AND MITIGATION

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Three.js testing limitations | High | High | Focus on logic testing, use visual testing for UI |
| Test flakiness due to timing | Medium | Medium | Use robust waitFor patterns, avoid time dependencies |
| Breaking changes to AuthService | High | Low | Use TDD approach, maintain backward compatibility |
| CI performance degradation | Medium | Medium | Optimize test execution, parallelize where possible |

## 8. SUPPORTING TECHNOLOGIES

1. **Vitest**: Primary testing framework
2. **@testing-library/react**: Component testing
3. **@testing-library/react-hooks**: Testing custom hooks
4. **@react-three/test-renderer**: Three.js component testing
5. **vitest-localstorage-mock**: Enhanced localStorage mocking
6. **Playwright/Cypress**: For visual E2E testing (future)

## 9. CONCLUSION

Resolving the skipped tests in the Clarity-AI-Frontend codebase is essential for ensuring product quality and maintainability. By implementing the strategies outlined in this document, we will achieve comprehensive test coverage, including previously challenging areas like authentication flows and 3D visualizations. The result will be a more robust, maintainable, and production-ready codebase.
