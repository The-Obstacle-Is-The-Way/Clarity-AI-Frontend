# Frontend Integration Checklist (Phase 2 – Feature Domains)

This checklist breaks down **per-domain** work required to integrate every remaining backend endpoint catalogued in `Backend_API_Verification_Phase2.md`.  Complete all Phase 1 boxes before starting these.

Legend  `[ ]` todo   `[x]` done   `[~]` in-progress

> Tip Work domain-by-domain; once a domain is green you can ship incremental value without waiting for the entire list.

---

## 1. Actigraphy Analytics

-   [ ] **Service Layer**
    -   [ ] `src/infrastructure/api/actigraphyService.ts` with
        - `getSummary(patientId)` → `GET /analytics/actigraphy/{patient_id}/summary`
        - `uploadCsv(patientId, file)` → `POST /analytics/actigraphy/{patient_id}/upload`
        - `getJobStatus(jobId)`
-   [ ] **TanStack Hooks** `useActigraphySummary`, `useActigraphyUpload`
-   [ ] **UI**
    -   [ ] `ActigraphyUploadForm.tsx` (drag-n-drop)
    -   [ ] `ActigraphySummaryChart.tsx` (D3 or Chart.js)
-   [ ] **Tests** unit + integration (MSW upload mock)

## 2. Generic Analytics Hub

-   [ ] **Service** `analyticsRunnerService.ts` (POST /analytics/runner, GET job)
-   [ ] **Hook** `useAnalyticsJob`
-   [ ] **UI** minimal job monitor component

## 3. Biometric Alerts

-   [ ] **Service** `biometricAlertsService.ts`
-   [ ] **UI**
    - `AlertsTable`, `AlertDrawer`
    - acknowledge button → mutation
-   [ ] **State** real-time updates via SSE or polling every 30 s

## 4. Biometric Alert Rules

-   [ ] CRUD forms with RHF + Zod tied to rule schema
-   [ ] RBAC – restrict create/delete to `admin` role

## 5. Biometric Streams

-   [ ] **LineChart** rendering samples
-   [ ] Virtualised list of stream types

## 6. Clinical Sessions

-   [ ] Sessions table (paginate)
-   [ ] Session detail modal + markdown notes viewer

## 7. Clinical NLP Analysis

-   [ ] Textarea input + results panel
-   [ ] Stream SSE response chunks to UI

## 8. Appointments

-   [ ] Calendar component (FullCalendar.io) wired to appointments endpoints

## 9. MentalLLaMA Chat

-   [ ] Service using `EventSource` for tokens
-   [ ] Chat UI (stream-in bubbles)

## 10. XGBoost Prediction (upgrade)

-   [ ] Switch hard-coded mock to real `/analytics/xgboost/predict`
-   [ ] Support CSV upload & result table

## 11. Symptom Assessments

-   [ ] List & detail pages; ensure PHQ-9 style scoring display

## 12. Temporal Neuro-transmitter Estimate (Experimental)

-   [ ] Simple numeric/graph display; flag as *experimental* in UI

---

## Cross-cutting Tasks

-   [ ] **API Proxy Mapping**: Add all new `/analytics`, `/biometrics`, etc. prefixes.
-   [ ] **Zod Schemas**: Create `src/domain/validation/*` per domain; use `.passthrough()` initially.
-   [ ] **Global Loading Indicator**: extend to cover SSE long-poll operations.
-   [ ] **ESLint Rule Update**: prohibit raw `/api/` path strings outside service layer.

---

*Doc auto-generated – 2024-06-XX* 