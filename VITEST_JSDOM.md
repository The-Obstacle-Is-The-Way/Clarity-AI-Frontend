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
*   **`Login.smoke.test.tsx` Issue (06/May/2025):** Despite a `vi.mock('@/infrastructure/api/authService', ...)` in the smoke test, the `Login` component's `handleSubmit` throws `ReferenceError: authService is not defined`. This indicates the mock is not correctly applying to the component's execution context.

## 4. Asynchronous Operations & Testing Library

*   **`act` Warnings:** Generally indicate React state updates outside Testing Library's `act()` or `userEvent`'s implicit `act` wrapping.
*   **`userEvent`:** Preferred for simulating real user interactions.
*   **Waiting for Updates:** Use `async/await`, `screen.findBy*`, or `vi.waitFor(() => expect(...))`.
*   **Previous Core Problem (Potentially Mitigated):** The issue where React state updates (`setIsLoading`, `setError`) in `Login.tsx` were not reflected in JSDOM after `userEvent.click` might have been linked to conflicting JSDOM instances. The absence of the "Worker exited unexpectedly" error in the latest smoke test is a positive sign.

## 5. Debugging Journey & Current State (This Project)

*   **Initial State:** Widespread `act` warnings, hangs, and `Worker exited unexpectedly` errors.
*   **Resolved - JSDOM Conflicts & Worker Crashes (Hypothesis):**
    *   Removed explicit `jsdom-global` package.
    *   Consolidated Vitest configurations to `config/vitest.config.ts`.
    *   Cleaned `setupFiles` to only `src/test/jest-dom-setup.ts` (for matchers).
    *   Ensured `jsdom` is a direct dev dependency (as required by the testing stack).
    *   **Result (06/May/2025):** The `Login.smoke.test.tsx` run **did not** produce the "Worker exited unexpectedly" error. This suggests the JSDOM instance conflict is likely resolved or significantly improved.
*   **Resolved - `Header.test.tsx`:** Tests pass after refactoring to match its presentational nature.
*   **New Blocker - `Login.smoke.test.tsx` & `Login.test.tsx`:**
    *   **Core Problem (06/May/2025):** When `Login.tsx`'s `handleSubmit` is triggered, it attempts to call `authService.login(...)` but throws a `ReferenceError: authService is not defined`. This occurs *within the component's code*, even though `Login.smoke.test.tsx` (and `Login.test.tsx`) define a `vi.mock('@/infrastructure/api/authService', ...)` for it.
    *   **Consequence:** Because of this runtime error in the component, the expected state updates (loading state, error messages) do not occur, causing the test assertions (`expect(button).toBeDisabled()`, `screen.findByText('...')`) to fail.
    *   This `ReferenceError` is now the primary obstacle for these tests.

## 6. Next Steps for Investigation

1.  **Resolve `authService` `ReferenceError` in `Login.tsx` when run under test:**
    *   Verify the exact import path and structure in `Login.tsx` vs. the mock in `*.test.tsx`.
    *   Investigate potential Vitest module mocking hoisting/scoping issues that might cause the mock not to apply correctly to the component's internal scope.
    *   Consider if the `authService.ts` file itself has any characteristics (e.g., re-exports, complex initialization) that might interfere with Vitest's mocking.
    *   Check `tsconfig.json` for `"types": ["vitest/jsdom"]` to ensure TypeScript JSDOM globals are recognized, though this is less likely the cause of a runtime `ReferenceError` for a module.
2.  **Confirm `Login.smoke.test.tsx` Passes:** Once the `authService` reference error is fixed, the smoke test (checking for button disabling) should pass, confirming the DOM updates correctly.
3.  **Restore and Fix Full `Login.test.tsx`:** Re-enable all assertions in the full `Login.test.tsx` and ensure they pass, leveraging the now-stable JSDOM environment.
4.  **Address Other Failing Tests:** Systematically address any other tests that were failing due to the previous JSDOM instability.

