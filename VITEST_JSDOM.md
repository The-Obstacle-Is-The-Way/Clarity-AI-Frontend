# Vitest + JSDOM Environment: Debugging & Best Practices

This document summarizes key points regarding the use of Vitest with the JSDOM environment, focusing on configuration, path aliases, mocking, and asynchronous testing, incorporating findings from debugging efforts within this project.

## 1. JSDOM Environment Configuration

*   **`vitest.config.ts` / `vite.config.ts`:** Ensure the test environment is explicitly set:
    ```typescript
    // vitest.config.ts or vite.config.ts
    /// <reference types="vitest" /> // Add this if using vite.config.ts
    import { defineConfig } from 'vite'; // or 'vitest/config'

    export default defineConfig({
      // ... other vite config
      test: {
        environment: 'jsdom', // Crucial setting
        globals: true, // Recommended for ease of use (describe, it, expect, vi)
        setupFiles: ['./vitest-setup.ts'], // If using jest-dom matchers
        // ... other test config
      },
    })
    ```
*   **`tsconfig.json`:** Adding JSDOM types can improve TypeScript integration and prevent type errors related to browser globals:
    ```json
    // tsconfig.json
    {
      "compilerOptions": {
        // Make sure "dom" is included in "lib"
        "lib": ["ESNext", "DOM", "DOM.Iterable"],
        // Add vitest globals and jest-dom types if used
        "types": ["node", "vitest/globals", "@testing-library/jest-dom"]
        // ... other compiler options
      }
    }
    ```
*   **Setup File (`vitest-setup.ts`):** If using `@testing-library/jest-dom` for custom matchers (like `toBeInTheDocument`), import it here:
    ```typescript
    // vitest-setup.ts
    import '@testing-library/jest-dom/vitest';
    ```

## 2. Path Alias Resolution

*   **Problem:** While `vite-tsconfig-paths` plugin works for Vite's runtime, Vitest might require explicit alias configuration within its own settings for reliable resolution during tests, especially within mocks or setup files.
*   **Recommended Configuration (`vitest.config.ts` / `vite.config.ts`):** Define aliases under the `test.alias` property using `new URL()` relative to the config file location for robustness:
    ```typescript
    // vitest.config.ts or vite.config.ts
    import { defineConfig } from 'vite'; // or 'vitest/config'
    import { URL, fileURLToPath } from 'node:url'; // Use node:url

    export default defineConfig({
      // resolve: { alias: { ... } } // For Vite runtime
      test: {
        alias: {
          // Use URL relative to config file location
          '@': fileURLToPath(new URL('./src', import.meta.url)),
          // Define aliases for domain, application, infrastructure, presentation
          '@domain': fileURLToPath(new URL('./src/domain', import.meta.url)),
          '@application': fileURLToPath(new URL('./src/application', import.meta.url)),
          '@infrastructure': fileURLToPath(new URL('./src/infrastructure', import.meta.url)),
          '@presentation': fileURLToPath(new URL('./src/presentation', import.meta.url)),
          // ... other aliases as needed
        },
        // ... other test config
      },
    })
    ```

## 3. Mocking (`vi.mock` / `vi.doMock`)

*   **Hoisting:** `vi.mock()` calls are hoisted (moved to the top) *before* static imports. The factory function cannot directly access variables defined later in the file unless using `vi.hoisted()`.
*   **Path Aliases in Mocks:** Using path aliases *inside* `vi.mock` can be unreliable. Prefer precise **relative paths** from the test file to the module being mocked.
*   **Mocking Dependencies of Dependencies:** Mocking a module (e.g., `authService`) used by another module (e.g., `AuthContext`) requires the mock to be in place *before* the intermediate module (`AuthContext`) imports the original. Moving the `vi.mock` call *into the test file* (`Header.test.tsx` initially, or `Login.test.tsx`) that uses the component needing the eventually mocked dependency is often necessary, rather than relying solely on global mocks (`setup.ts`).
*   **ESM Default Exports:** When mocking a module with a default export, provide a `default` key in the factory: `vi.mock('./mod', () => ({ default: vi.fn(), namedExport: vi.fn() }))`.
*   **Automocking (`__mocks__`):** Vitest can use files in adjacent `__mocks__` directories if no factory is provided to `vi.mock`. This is *not* enabled by default like Jest; `vi.mock('modulePath')` must still be called.
*   **`vi.doMock()`:** Non-hoisted alternative, only affects subsequent *dynamic* imports (`await import(...)`).

## 4. Asynchronous Operations & Testing Library

*   **`act` Warnings:** Often caused by React state updates occurring *after* a test interaction (like fetch in `useEffect` or event handlers) but *outside* Testing Library's `act()` wrapper, meaning React updates the DOM after the test potentially finished checking it.
*   **`userEvent` vs `fireEvent`:** `userEvent` (v14+) aims to simulate real user interactions more closely and generally handles `act` wrapping internally for realistic async behavior. Older `fireEvent` is more synchronous.
*   **Waiting for Updates:**
    *   Use `async`/`await` in test functions.
    *   Use `screen.findBy*` queries, which return promises that resolve when the element is found (they use `waitFor` internally).
    *   Use `waitFor(() => expect(...))` to wait for specific assertions to pass after an interaction.
    *   **Project Issue:** In `Login.test.tsx`, despite using `userEvent`, `async/await`, and `waitFor`/`vi.waitFor`, state updates (`setIsLoading`, `setError`) triggered by `handleSubmit` after `userEvent.click(submitButton)` are **not reliably reflected in the JSDOM DOM** before `waitFor` times out. This suggests a deeper issue with the test environment's handling of state updates post-event.
*   **Vitest Native `vi.waitFor`:** Vitest offers its own `vi.waitFor`. Switching from RTL's `waitFor` to `vi.waitFor` in `Login.test.tsx` **did not** resolve the underlying state update visibility issue, further indicating an environmental problem rather than just a library timing conflict.

## 5. Debugging Journey & Current Blockers (This Project)

*   **Initial State:** Widespread `act` warnings, hangs, and `Worker exited unexpectedly` errors. Initial hypothesis: async operations in `AuthProvider`.
*   **Resolved - `Header.test.tsx`:** Successfully fixed by recognizing the component was presentational and rewriting tests to match, removing unnecessary auth mocking complexity. Tests now pass.
*   **Resolved - `neuro-sync.orchestrator.test.ts`:** A specific hang/memory issue here was traced to faulty timer/async logic within that test and fixed by simplifying the test logic.
*   **Current Blocker - `Login.test.tsx`:** This remains the primary source of instability and likely the cause of the worker error.
    *   **Core Problem:** React state updates (`setIsLoading`, `setError`) set within the `handleSubmit` function (after validation or async `authService.login` calls) are **not reflected in the JSDOM DOM** in time for `vi.waitFor` assertions to pass.
        *   `expect(submitButton).toBeDisabled()` fails because the button doesn't appear disabled after `setIsLoading(true)`.
        *   `expect(await screen.findByText(...))` times out because the error message element doesn't appear after `setError()`.
    *   **Attempted Fixes:**
        *   Standard async patterns (`async`/`await`, `userEvent`).
        *   Correct `vi.mock` for `authService` within the test file.
        *   Refactoring `Login.tsx` to use actual `authService.login` call.
        *   Using RTL `waitFor`.
        *   Using Vitest `vi.waitFor`.
        *   Increasing `waitFor` timeouts.
        *   Adding extensive `console.log` tracing.
        *   Checking intermediate loading states (`toBeDisabled`).
        *   Temporarily removing component's internal validation logic.
    *   **Conclusion:** The issue seems environmental, related to how Vitest/JSDOM handles React state updates triggered by `userEvent` interactions. Standard debugging within the component/test logic has been exhausted.
*   **Symptom - `Worker exited unexpectedly`:** This error persists and is highly likely linked to the instability and timeouts occurring within `Login.test.tsx`. Resolving the `Login` tests is the most probable way to eliminate the worker error.

## 6. Next Steps for Investigation

1.  **Targeted Research:** Search for known issues/bugs/configurations related to `vitest` + `jsdom` + `userEvent` + React `useState` updates not rendering synchronously after events.
2.  **Configuration Review:** Deeply examine `vite.config.ts` / `vitest.config.ts` for any non-standard JSDOM options, threading, or environment settings.
3.  **Test Isolation:** Create a minimal reproduction case (e.g., a new test file) rendering *only* the `Login` component and attempting the failing interaction/assertion sequence to rule out interference from other tests or setup.
4.  **Consider Alternatives (If Necessary):** Explore if simpler event triggering (like `fireEvent`) behaves differently, or if specific Vitest/JSDOM configurations (e.g., related to event loop timing) can be adjusted.
