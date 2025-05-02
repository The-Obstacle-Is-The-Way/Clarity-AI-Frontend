# Frontend Integration Checklist (Phase 1)

This checklist outlines the frontend tasks required to integrate with the verified backend API for Phase 1 features, based on the findings in `docs/Backend_API_Verification_Phase1.md`.

**Reference:** `docs/E2E/README.md` (Phase 1)
**DIRECTORIES**: 
        "/Users/ray/Desktop/CLARITY-DIGITAL-TWIN/Clarity-AI-Backend",
        "/Users/ray/Desktop/CLARITY-DIGITAL-TWIN/Clarity-AI-Frontend"
            - Both are available via MCP Tool
---

## Prerequisites

- [x] Verify backend API endpoints and schemas (See `docs/Backend_API_Verification_Phase1.md`)
- [x] Modify `ApiGateway.ts` to default to the *real* `ApiClient` in development mode.

---

## Tasks

### 0. Mode Switch & Diagnostics (NEW)

-   [ ] **Disable Mock Mode**
    -   [ ] Set `ApiGateway.mockMode` default to **false** and/or respect `VITE_USE_MOCK_API`.
    -   [ ] Ensure `ApiGateway` forwards `withCredentials: true` on every call.
-   [ ] **Axios/Fetch Interceptors**
    -   [ ] Add a global 401 handler that triggers `authService.refreshToken()` once, then retries original request.
    -   [ ] Log backend error traces to `console.error` in ***development*** only.

### 1. Configuration

-   [x] **Vite Proxy:** Already points to `http://localhost:8000` – verified 2024-06-XX.
-   [ ] **Env Flags:**
    -   [ ] Add `VITE_API_BASE_URL=/api/v1` to `.env.development`.
    -   [ ] Add `VITE_USE_MOCK_API=false` to toggle real backend.

### 2. Authentication Integration (Phase 1, Item 2)

-   [ ] **Interceptors:** Attach silent refresh logic (see Diagnostics).
-   [ ] **AuthContext:** Expose `isLoadingInitial`, `hasSessionExpired` flags.
-   [ ] **Unit Tests:** Mock cookie behaviour & refresh logic using msw.

### 3. Patient Service Integration (Phase 1, Item 3 - Partial)

-   [ ] **Refactor Endpoints** to `/api/v1/patients/*` (Create, Get, Update, Delete).
-   [ ] **Remove List Hook** until backend provides list endpoint **OR** implement fallback local-cache.
-   [ ] **Zod Transformer** that converts raw `Dict` to typed `Patient` (best-effort mapping).

### 4. Brain Model Service Integration (Phase 1, Item 4)

-   [ ] **Create `digitalTwinService.ts`** with `getVisualization(patientId, type?)`.
-   [ ] **Replace all `/brain-models/` hard-coded paths** (grep-cleanup across `ApiProxyService`, tests, mocks, pages).
-   [ ] **Zod Passthrough Schema** for visualization response.
-   [ ] **Hook:** `useBrainVisualization(patientId)` using TanStack Query.
-   [ ] **UI Adaptation:** `BrainModelViewer` → rename prop `visualization` and accept opaque structure.

### 5. Documentation & Quality Gates *(NEW)*

-   [ ] **ESLint Rule:** ban literal string "brain-models".
-   [ ] **ADR-007:** Document switch from Brain-Model to Digital-Twin API.

### 6. Testing Suite Updates *(NEW)*

-   [ ] **MSW Handlers:** Add `/api/v1/digital-twins/:patientId/visualization` mock.
-   [ ] **Remove Legacy Tests:** All tests referencing `/brain-models/*`.
-   [ ] **Add Cypress e2e** smoke test: login → fetch visualization → render.

### 7. Backend Collaboration Checklist (mirror of backend doc)

-   [ ] **Await `GET /patients/`** list endpoint or agree on alt strategy.
-   [ ] **Confirm visualization JSON schema**; update Zod types accordingly when published.

---

## Post-Integration

- [ ] Update `docs/E2E/README.md` checklist items for Phase 1 upon completion of relevant tasks.
- [ ] Address any CORS issues encountered during integration.
- [ ] Perform thorough testing of integrated features. 

*Last updated by Novamind Frontend Agent – 2024-06-XX* 