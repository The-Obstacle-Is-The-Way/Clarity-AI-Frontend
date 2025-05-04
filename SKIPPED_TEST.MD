# Skipped Tests - Resolution Strategy

## Executive Summary

This document outlines the strategy for resolving 17 skipped tests across our codebase. These tests are critical for ensuring the proper functioning of authentication, theme management, and 3D brain visualization.

### Skipped Test Count
- AuthService.enhanced.test.ts: 13 tests
- ThemeProvider.enhanced.test.ts: 1 test
- BrainModelVisualization.test.ts: 3 tests

## Current Progress (Updated May 4, 2025)

- **AuthService.enhanced.test.ts**: 
  - Created the AuthServiceTestHarness utility 
  - Attempted to fix tests by using direct mocking approach instead of relying on the harness
  - Running into issues with mock injection - the EnhancedAuthService creates its own client instance that we can't easily intercept
  - Current approach: mocking at the module level, but facing challenges with initialization timing

- **ThemeProvider.enhanced.test.ts**: 
  - Created ThemeTestUtils for controlled theme state manipulation
  - Test still skipped as we need to resolve the timing issues with localStorage

- **BrainModelVisualization.test.ts**:
  - Created ThreeTestUtils for testing Three.js components without WebGL
  - Tests remain skipped, pending implementation of the rendering context mocks

## Strategy

### 1. AuthService Tests
Despite initial progress, we're facing fundamental architectural challenges with the EnhancedAuthService class implementation:

1. **Current Issues:**
   - The AuthService creates its client internally making it difficult to inject mocks
   - vi.mock doesn't work properly due to hoisting issues and module initialization order
   - Using prototype spying doesn't work consistently 

2. **New Approach:**
   - Consider refactoring the EnhancedAuthService to accept a client through dependency injection
   - Create a new extended TestableEnhancedAuthService class with additional test helper methods
   - Simplify tests by focusing on core functionality only

### 2. ThemeProvider Tests
The main challenge is synchronizing localStorage operations with the React component lifecycle:

1. **Solution:**
   - Use ThemeTestUtils to properly control the theme state
   - Apply debounce techniques to manage the timing of theme changes
   - Add explicit act() wrappers around localStorage operations

### 3. BrainModel Tests
Three.js integration testing requires special handling:

1. **Progress:**
   - ThreeTestUtils provides mock implementations of Three.js components
   - Still need to implement WebGL context simulation
   - Currently investigating using headless-gl for node.js environments

## Implementation Timeline

**Phase 1 (CURRENT FOCUS):** Finalize the testing utilities and fix at least one test in each category
- Complete AuthServiceTestHarness
- Complete ThemeTestUtils
- Complete ThreeTestUtils

**Phase 2:** Systematically fix each skipped test by applying the testing utilities
- Fix AuthService token refresh tests
- Fix AuthService permission verification
- Fix ThemeProvider test
- Fix at least one BrainModel visualization test

**Phase 3:** Refine testing patterns and document best practices
- Create common testing patterns
- Update documentation
- Add examples to the developer guide

## Risk Mitigation

1. **AuthService Complexity:**
   - Consider splitting tests into smaller, focused test suites
   - May need to refactor service for better testability

2. **Asynchronous Timing:**
   - Create explicit lifecycle management for tests
   - Document common patterns for testing asynchronous code

3. **Three.js Rendering:**
   - Consider mocking at a higher level to avoid WebGL context issues
   - May need to replace some integration tests with unit tests

## Success Criteria

- All 17 skipped tests now passing
- Clear patterns established for testing each component type
- Documentation updated with testing best practices
- Test coverage increased to minimum 80%

## Next Steps

1. **AuthService:**
   - Research alternate architecture for better testability
   - Simplify the tests to focus on core functionality only
   - Consider creating a factory function for testing

2. **ThemeProvider:**
   - Address the localStorage timing issues
   - Implement enhanced mocking for theme state

3. **BrainModel:**
   - Complete the WebGL context simulation
   - Focus on critical rendering paths first
