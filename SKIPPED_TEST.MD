# Skipped Tests - Resolution Strategy

## Executive Summary

This document outlines the strategy for resolving 17 skipped tests across our codebase. These tests are critical for ensuring the proper functioning of authentication, theme management, and 3D brain visualization.

### Skipped Test Count
- AuthService.enhanced.test.ts: 13 tests -> 12 tests (1 fixed)
- ThemeProvider.enhanced.test.ts: 1 test
- BrainModelVisualization.test.ts: 3 tests

## Current Progress (Updated May 4, 2025)

- **AuthService.enhanced.test.ts**: 
  - Created the AuthServiceTestHarness utility
  - Successfully fixed the "should attempt to refresh token when it has expired" test by implementing a TestableEnhancedAuthService class that:
    - Overrides the `refreshTokenSilently` method with a mock implementation
    - Overrides the `initializeAuth` method to avoid network calls
    - Provides testable flags to track method calls
  - Added a new test case to verify that valid tokens are not refreshed
  - Remaining tests still need to be fixed using the same pattern

- **ThemeProvider.enhanced.test.ts**:
  - Created the ThemeTestUtils utility
  - Still investigating localStorage timing issues
  - Need to implement a solution similar to the AuthService approach

- **BrainModelVisualization.test.ts**:
  - Created the ThreeTestUtils utility
  - Need to implement mocks for Three.js WebGL context

## Implementation Approach

### 1. AuthService.enhanced.test.ts

Our approach for fixing the AuthService tests involves creating a testable subclass of AuthService that:

- Overrides network-dependent methods with mock implementations
- Uses direct dependency injection instead of trying to mock imported modules
- Tracks method calls using flags rather than relying on complex spies
- Passes direct test data instead of relying on network responses

The key insight was that trying to mock the module imports was problematic because the EnhancedAuthService creates its own client instance internally. By extending the class and overriding the methods directly, we have much more control over the test behavior.

### 2. ThemeProvider.enhanced.test.ts

We'll apply a similar approach to the ThemeProvider tests by:

- Creating a testable ThemeProvider that overrides localStorage interactions
- Manually controlling theme state in tests
- Avoiding race conditions in the test environment

### 3. BrainModelVisualization.test.ts

For Three.js tests, we'll:

- Create mock implementations of WebGL-dependent components
- Test the control flow and state management rather than the actual rendering
- Focus on testing the business logic rather than the visual output

## Next Steps

1. Apply the TestableEnhancedAuthService approach to the remaining 12 skipped tests in AuthService.enhanced.test.ts
2. Implement a similar approach for ThemeProvider.enhanced.test.ts
3. Create mock implementations for Three.js in BrainModelVisualization.test.ts
4. Update the test harnesses as needed to support all test cases
5. Document the patterns used so they can be applied to future tests

## Success Criteria

- All 17 skipped tests should be unskipped and passing
- No unstable tests (flaky tests that sometimes pass and sometimes fail)
- Clear documentation of testing patterns for future tests
- No real API calls or network dependencies in tests
