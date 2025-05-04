# Skipped Tests Documentation

This document provides information about skipped tests in the Clarity-AI-Frontend codebase and the reasons they're skipped. It also provides guidance on how to fix these tests in the future.

## Overview of Skipped Tests

The codebase currently has 17 skipped tests:
- 13 tests in `src/infrastructure/auth/AuthService.enhanced.test.ts` related to complex mocking
- 1 test in `src/application/providers/ThemeProvider.enhanced.test.tsx` related to localStorage timing issues
- 3 visualization component tests in `src/presentation/molecules/visualization/BrainModelVisualization.test.tsx` related to Three.js testing challenges

## 1. AuthService.enhanced.test.ts

### Issues

The skipped tests in `AuthService.enhanced.test.ts` have several technical challenges:

1. **Complex Dependency Mocking**: The AuthService class has dependencies on AuthApiClient that are difficult to mock correctly.
2. **TypeScript Errors with Mocks**: When attempting to mock localStorage or other browser APIs, TypeScript type errors occur.
3. **Callback Timing**: Tests involving token refresh, especially with timers, are difficult to control and verify.
4. **Private Method Access**: Some tests need to verify behavior of private methods in the AuthService class.

### Solution Strategy

To fix these tests:

1. **Create a Special Test Harness**: 
   - Create a mock implementation of AuthApiClient specifically for testing
   - Use dependency injection to pass the mock client to the AuthService
   - Create a TestableAuthService subclass that exposes protected methods for testing

2. **Use Jest/Vitest Features**:
   - Use `jest.useFakeTimers()` to control time-based behavior
   - Use proper type assertions for localStorage mocks
   - Consider creating a local mock implementation of localStorage

3. **Extract Complex Logic**:
   - Move complex token refresh logic to smaller, testable functions
   - Use higher-order functions to make dependencies injectable

## 2. ThemeProvider.enhanced.test.tsx

### Issues

The skipped test in `ThemeProvider.enhanced.test.tsx` has the following issues:

1. **Timing Issues**: The interaction between localStorage, React effects, and DOM updates is timing-sensitive.
2. **Environment Inconsistency**: The test environment doesn't consistently apply theme changes in the expected order.

### Solution Strategy

To fix this test:

1. **Use waitFor with Longer Timeout**: 
   - Increase timeout for waitFor to allow theme changes to propagate
   - Use more specific assertions about DOM state

2. **Mock React Hooks**:
   - Consider mocking React's useEffect to have more control over execution timing
   - Create explicit callbacks when theme changes are applied

3. **Clean Environment**:
   - Ensure document classes are cleared before each test
   - Reset localStorage before each test

## 3. Visualization Component Tests

### Issues

Tests for Three.js-based visualization components have unique challenges:

1. **WebGL Context**: These components require a WebGL context that is difficult to mock in tests.
2. **GPU Acceleration**: Three.js relies on GPU acceleration which doesn't exist in test environments.
3. **Performance**: Rendering complex 3D scenes in tests can be slow and unreliable.
4. **Canvas Output**: Verifying visual output requires screenshot testing capabilities.

### Solution Strategy

For Three.js components, a multi-layered testing approach is recommended:

1. **Unit Test Logic Only**:
   - Extract pure logic functions from components and unit test them
   - Mock Three.js primitives for basic structure tests

2. **Use Component Stories/Storybook**:
   - Create interactive Storybook stories for visual testing
   - Document behavior with story annotations

3. **E2E Testing**:
   - Use Cypress/Playwright for E2E tests of critical 3D visualizations
   - Implement screenshot comparison for visual regression testing

4. **Runtime Monitoring**:
   - Add performance monitoring for 3D components in production
   - Log WebGL errors and performance metrics

## Action Plan for Addressing Skipped Tests

1. **Short-term Fixes**:
   - Create better documentation for each skipped test
   - Ensure skipped tests don't break CI/CD pipelines
   - Add manual testing procedures for uncovered functionality

2. **Medium-term Improvements**:
   - Create test utilities for common testing challenges
   - Refactor complex components to be more testable
   - Add integration tests for key user flows

3. **Long-term Solutions**:
   - Implement a comprehensive testing strategy for 3D components
   - Create specialized test environments for WebGL testing
   - Consider using specialized testing libraries for Three.js components

## Reporting Test Results

Despite skipped tests, we maintain test coverage through:

1. **Alternative Test Approaches**: Using E2E, story tests, or manual tests for skipped areas
2. **Comprehensive Documentation**: Documenting known issues and manual testing procedures
3. **Regular Test Review**: Periodically reviewing skipped tests to determine if they can be fixed 