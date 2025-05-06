# Vitest + JSDOM Environment: Debugging & Best Practices

This document summarizes key points regarding the use of Vitest with the JSDOM environment, focusing on configuration, path aliases, mocking, and asynchronous testing, incorporating findings from debugging efforts within this project.

## 1. JSDOM Environment Configuration

*   **`vitest.config.ts` (Primary: `config/vitest.config.ts`):** Ensure the test environment is explicitly set:
    ```typescript
    // config/vitest.config.ts
    import { defineConfig } from 'vitest/config';

    export default defineConfig({
      test: {
        environment: 'jsdom', // Crucial setting
        globals: true, // Recommended for ease of use (describe, it, expect, vi)
        setupFiles: ['./src/test/jest-dom-setup.ts'], // For jest-dom matchers
        // ... other test config
      },
    });
    ```
*   **`jsdom` Dependency:**
    *   Initial hypothesis: Relying solely on Vitest's bundled JSDOM and removing `jsdom` from `package.json` would resolve conflicts.
    *   **Current Finding (06/May/2025):** Running tests that use DOM manipulation (e.g., with `@testing-library/react` and `userEvent`) **still triggers Vitest to prompt for `jsdom` installation if it's not in `package.json`**. This indicates that `jsdom` is treated as a required peer or direct dependency by some part of the testing stack (Vitest, RTL, or user-event).
    *   **Resolution:** `jsdom` should be present in `devDependencies`. The focus is on ensuring *Vitest's configured JSDOM environment* is the one used and that there are no conflicting global JSDOM setups (like from the now-removed `jsdom-global` package).
*   **`tsconfig.json` (Root):** Adding JSDOM types can improve TypeScript integration. Ensure `"types"` includes `"vitest/jsdom"` or similar if issues arise, and `"lib"` includes `"DOM"` and `"DOM.Iterable"`.
    ```json
    // tsconfig.json (example relevant parts)
    {
      "compilerOptions": {
        "lib": ["ESNext", "DOM", "DOM.Iterable"],
        "types": ["node", "vitest/globals", "@testing-library/jest-dom", "vitest/jsdom"] // Add "vitest/jsdom"
      }
    }
    ```
*   **Setup File (`src/test/jest-dom-setup.ts`):** This file should *only* import Jest DOM matchers. Global mocks were removed from other setup files.
    ```typescript
    // src/test/jest-dom-setup.ts
    import '@testing-library/jest-dom/vitest';
    ```
*   **Configuration Consolidation:** Multiple Vitest config files (`vitest.config.clean.ts`, `vitest.config.unified.ts`) were deleted. `config/vitest.config.ts` is the sole Vitest configuration file, invoked by `package.json` scripts.

## 2. Path Alias Resolution

*   **Recommended Configuration (`config/vitest.config.ts`):** Define aliases under `test.alias` using `new URL()` relative to the config file.
    ```typescript
    // config/vitest.config.ts
    import { defineConfig } from 'vitest/config';
    import { URL } from 'node:url'; // No need for fileURLToPath with new URL and .pathname

    export default defineConfig({
      test: {
        alias: {
          '@': new URL('../src', import.meta.url).pathname,
          '@domain': new URL('../src/domain', import.meta.url).pathname,
          // ... other aliases
        },
      },
    });
    ```

## 3. Mocking (`vi.mock` / `vi.doMock`)

*   **Hoisting:** `vi.mock()` calls are hoisted.
*   **Path Aliases in Mocks:** Prefer precise **relative paths** or ensure aliases are robustly configured and resolved by Vitest.
*   **Mocking Scope:** For dependencies of components (e.g., `authService` used by `Login.tsx`), mocks typically need to be in the test file itself.
*   **Mock Implementation vs. Spy:** Based on the analysis of the current tests, there are two primary approaches to mocking the `authService`:
    1. **Mock Implementation** (`vi.mock()`): Completely replaces the module with a mock implementation.
    ```typescript
    vi.mock('@/infrastructure/api/authService', () => ({
      authService: {
        login: vi.fn().mockImplementation((credentials) => {
          console.log(`[MOCK] authService.login called with:`, credentials);
          return Promise.resolve({ success: true });
        }),
        // other methods...
      }
    }));
    ```
    
    2. **Spy on Real Methods** (`vi.spyOn()`): Preserves the real implementation but allows intercepting calls.
    ```typescript
    const loginSpy = vi.spyOn(authService, 'login').mockImplementation(async (credentials) => {
      await new Promise(resolve => setTimeout(resolve, 0));
      return { success: true };
    });
    ```

*   **Identified Issue:** In `Login.smoke.test.tsx`, the spy approach works correctly because it preserves the real method references while overriding behavior. The mock implementation approach in other tests might be creating a discrepancy between what's imported by the component versus what's used in the test.

## 4. Asynchronous Operations & Testing Library

*   **`act` Warnings:** Generally indicate React state updates outside Testing Library's `act()` or `userEvent`'s implicit `act` wrapping.
*   **`userEvent`:** Preferred for simulating real user interactions.
*   **Waiting for Updates:** Use `async/await`, `screen.findBy*`, or `waitFor(() => expect(...))`.
*   **Resolving Loading State Issues:** The `Login.debug.test.tsx` and `Login.super.test.tsx` files demonstrate comprehensive approaches to ensuring loading state is visible in tests:
    
    1. **Multiple assertion techniques:** Using both `screen.findByText()` and `waitFor()` with specific timeouts
    2. **Deliberate delays in mocks:** Including small timeouts (50-100ms) in mock implementations
    3. **Console logging at each step:** To diagnose exactly where state updates might be failing
    4. **Using `flushSync`:** In the component to ensure synchronous state updates

## 5. Parameter Signature Mismatch

*   **Root Cause Identified:** A critical issue identified is a parameter signature mismatch between how the `authService.login` method is called in the `Login.tsx` component and how it's defined in `authService.ts`:
    
    - **Component calls:** `authService.login(email, password)`
    - **Actual signature:** `login: async (credentials: LoginCredentials): Promise<AuthResult>`
    
    This mismatch explains why tests weren't functioning correctly - the mock implementations were designed for the wrong parameter structure.

*   **Solution Options:**
    1. **Fix component to use correct signature:** Update `Login.tsx` to call `authService.login({ email, password })` with the object parameter structure
    2. **Fix mock implementations:** Ensure mocks accept the same parameters as the component is sending

## 6. Comprehensive Debugging Techniques

*   **Log state transitions:** Both component and tests include detailed logging
*   **Visual DOM state snapshots:** The `Login.super.test.tsx` uses `logCurrentDOM` to capture DOM state at critical points
*   **Test utilities:** The project includes dedicated utilities in `debug-utils.ts` for consistent logging
*   **Execution tracing:** Console logs are strategically placed to track the exact flow of execution

## 7. Next Steps for Fixing Tests

1.  **Fix Parameter Mismatch:**
    - Verify if the component's call to `authService.login(email, password)` should be updated to match the service definition
    - Alternatively, check if the mocks should be updated to accept the parameters as the component calls them

2.  **Standardize Mocking Approach:**
    - Choose either the "mock implementation" or "spy" approach consistently across tests
    - If using mock implementation, ensure it's placed before any imports that might use the module

3.  **Update Assertions:**
    - Use `waitFor()` with appropriate timeouts for async state updates
    - Consider using `screen.findByText()` for text that appears after state updates
    - Verify button disabled states with appropriate selectors

4.  **Cleanup and Standardize:**
    - Consolidate debug utilities
    - Standardize mock implementations
    - Document successful patterns

By implementing these changes, the tests should become more reliable and consistent.

## 8. Issue Resolution Summary

The investigation identified and resolved the following critical issues with the Vitest + JSDOM test environment:

1. **Parameter Signature Mismatch Fixed:**
   - Root Cause: The `Login.tsx` component was calling `authService.login(email, password)` with separate parameters, while the actual service expected a single object parameter: `login({ email, password })`
   - Resolution: Updated the component to use the correct parameter structure: `authService.login({ email, password })`
   - Fixed all test mocks to match this signature

2. **Mock Implementation Consistency:**
   - Root Cause: Different test files were using inconsistent approaches to mocking - some using `vi.mock()` implementations and others using `vi.spyOn()`
   - Resolution: Standardized mock implementation to consistently accept credential objects `(credentials) => { ... }` rather than separate parameters

3. **Asynchronous Testing Stability:**
   - Root Cause: Tests weren't properly waiting for state updates and async operations to complete
   - Resolution: 
     - Added deliberate delays in mock implementations to ensure state transitions are observable
     - Used both `screen.findByText()` and `waitFor()` with appropriate timeouts
     - Added comprehensive logging to trace execution flow

4. **Test Reliability Improvements:**
   - Root Cause: Inconsistent test approaches and unreliable selectors made tests flaky
   - Resolution:
     - Enhanced button selectors to be more specific: `screen.getByText(/sign in/i, { selector: 'button[type="submit"]' })`
     - Added detailed error handling and DOM state logging for better debugging
     - Used explicit assertion timeouts to prevent premature test failures

Through these changes, the test suite now runs reliably and consistently captures the component's expected behavior, including loading states and error handling. This approach should be applied to all similar component tests that exhibit the same issues.

