# Test Suite Stabilization Plan (Async/Await & Worker Exit)

**Product Requirement Document (PRD) - Internal**

## 1. Goal

Achieve a consistently stable and clean test suite (`npm test`) execution, free from `act(...)` warnings related to asynchronous provider updates and the final `Error: Worker exited unexpectedly` crash.

## 2. Background

The test suite currently suffers from two primary issues:
1.  **Asynchronous State Updates:** The `AuthProvider` initializes asynchronously (checking authentication status via `useEffect` -> `checkAuthStatus`). Tests rendering components dependent on this provider often complete their initial render before the auth status is resolved, leading to state updates outside of `act(...)` and causing React warnings.
2.  **Worker Exit Error:** The test suite frequently terminates with `Error: Worker exited unexpectedly`. This is likely a symptom of accumulated instability caused by the unhandled asynchronous updates, potential subtle memory leaks, or other side effects across numerous tests.

The previous hang in `neuro-sync.orchestrator.test.ts` related to timer handling has been resolved.

## 3. Hypothesis

-   The `act(...)` warnings can be eliminated by ensuring tests explicitly wait for asynchronous operations (like `AuthProvider`'s `checkAuthStatus`) to complete before making assertions on the final DOM state.
-   Resolving the `act(...)` warnings and ensuring proper handling of asynchronous operations will likely resolve the downstream `Worker exited unexpectedly` error by improving overall test suite stability.

## 4. Implementation Plan & Checklist

-   `[ ]` **Identify Affected Tests:** Systematically identify all test files (`*.test.tsx`) that utilize `render` (our custom `renderWithProviders`) and exhibit `act(...)` warnings related to `AuthProvider` or other asynchronous context/hook updates during initialization. Use current logs and codebase searches.
-   `[ ]` **Refactor with `waitFor`/`findBy`:** Modify the identified tests. Replace synchronous queries (`screen.getBy...`) that assert on content potentially affected by async updates with asynchronous queries (`await screen.findBy...`) or wrap the relevant assertions in `await waitFor(...)`.
    -   *Example:*
        ```typescript
        // Before:
        render(<MyComponentDependingOnAuth />);
        expect(screen.getByText('User Data Loaded')).toBeInTheDocument(); // Might fail or warn

        // After:
        render(<MyComponentDependingOnAuth />);
        await waitFor(() => {
          expect(screen.getByText('User Data Loaded')).toBeInTheDocument();
        });
        // or
        expect(await screen.findByText('User Data Loaded')).toBeInTheDocument();
        ```
    -   *Priority:* Start with tests showing the most warnings in logs (e.g., `progress.test.tsx`, `scroll-area.test.tsx`, `RegionSelectionIndicator.test.tsx`).
-   `[ ]` **Investigate Worker Exit (If Necessary):** After significantly reducing `act` warnings, re-run `npm test`. If the `Worker exited unexpectedly` error persists:
    -   `[ ]` Review test setup/teardown (`beforeEach`, `afterEach`) for potential resource leaks or ordering issues.
    -   `[ ]` Check for unhandled promise rejections across tests.
    -   `[ ]` Consider running tests with increased memory (`NODE_OPTIONS=--max-old-space-size=4096 npm test`).
    -   `[ ]` Analyze complex mocks for unintended side effects.
-   `[ ]` **Address Formatting:** Manually fix the minor indentation error in `src/application/services/controllers/orchestration/neuro-sync.orchestrator.test.ts` (line 81) if feasible during other edits, otherwise ignore as it's non-blocking.

## 5. Verification

The plan is complete when `npm test` runs successfully with:
-   Zero test failures.
-   Zero `act(...)` warnings related to provider updates.
-   No `Error: Worker exited unexpectedly`.
