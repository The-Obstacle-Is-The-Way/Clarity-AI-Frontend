# Backend API Verification Summary (Phase 1)

        "/Users/ray/Desktop/CLARITY-DIGITAL-TWIN/Clarity-AI-Backend",
        "/Users/ray/Desktop/CLARITY-DIGITAL-TWIN/Clarity-AI-Frontend"
            - Both are available via MCP Tool

This document summarizes the verified backend API endpoints and schemas identified in the `Clarity-AI-Backend` codebase (`/Users/ray/Desktop/CLARITY-DIGITAL-TWIN/Clarity-AI-Backend`) relevant to Phase 1 frontend integration.

**Base Path:** `/api/v1/`
**DIRECTORIES**: 
        "/Users/ray/Desktop/CLARITY-DIGITAL-TWIN/Clarity-AI-Backend",
        "/Users/ray/Desktop/CLARITY-DIGITAL-TWIN/Clarity-AI-Frontend"
            - Both are available via MCP Tool
            
---

## 1. Authentication

**Source File:** `app/presentation/api/v1/endpoints/auth.py`

*   **Login:**
    *   **Method:** `POST`
    *   **Path:** `/api/v1/auth/login`
    *   **Request Body (`LoginRequest`):** `{ username: str, password: str, remember_me: bool }`
    *   **Response Body (`TokenResponse`):** `{ access_token: str, refresh_token: str, token_type: "bearer", expires_in: int }`
    *   **Notes:** Sets `access_token` and `refresh_token` as HttpOnly cookies. Frontend should primarily rely on cookies for session management after login.
*   **Refresh Token:**
    *   **Method:** `POST`
    *   **Path:** `/api/v1/auth/refresh`
    *   **Request Body (`RefreshRequest` - Optional):** `{ refresh_token: str }` (Also reads `refresh_token` from cookie)
    *   **Response Body (`TokenResponse`):** Same as Login.
    *   **Notes:** Used to obtain a new access token using the refresh token. Frontend might need logic to handle token expiration and refresh.
*   **Logout:**
    *   **Method:** `POST`
    *   **Path:** `/api/v1/auth/logout`
    *   **Request Body:** None (Uses tokens from cookies/headers)
    *   **Response:** `204 No Content`
    *   **Notes:** Clears auth cookies. Frontend should call this endpoint upon user logout action.
*   **Get Current User:**
    *   **Method:** `GET`
    *   **Path:** `/api/v1/auth/me`
    *   **Request:** Requires valid access token (via cookie or Authorization header, handled by backend dependency `get_current_user`).
    *   **Response Body (`UserResponse`):** `{ id: str, email: EmailStr, first_name: Optional[str], last_name: Optional[str], roles: list[str], is_active: bool }`
    *   **Notes:** Essential for initializing `AuthContext` on application load or after login/refresh.

---

## 2. Patients

**Source File:** `app/presentation/api/v1/endpoints/patients.py`
**Schema File:** `app/presentation/api/v1/schemas/patient.py` (Currently a placeholder)

*   **Notes:**
    *   The backend implementation currently uses a **simple in-memory store** for testing purposes, not a persistent database.
    *   Endpoints accept and return plain `Dict[str, Any]` rather than strictly typed Pydantic models defined in the placeholder schema file. Frontend needs to handle this.
    *   Includes specific hardcoded logic for a test patient ID "P12345".
*   **Create Patient:**
    *   **Method:** `POST`
    *   **Path:** `/api/v1/patients/`
    *   **Request Body (`Dict[str, Any]`):** Requires `id`, `medical_record_number`, `name`. Optional: `date_of_birth` (str YYYY-MM-DD), `gender` (str), `email` (str).
    *   **Response Body (`Dict[str, Any]`):** Echoes back the created patient data dictionary.
*   **Get Patient by ID:**
    *   **Method:** `GET`
    *   **Path:** `/api/v1/patients/{patient_id}`
    *   **Request:** Path parameter `patient_id: str`
    *   **Response Body (`Dict[str, Any]`):** Patient data dictionary.
*   **Update Patient:**
    *   **Method:** `PATCH`
    *   **Path:** `/api/v1/patients/{patient_id}`
    *   **Request Body (`Dict[str, Any]`):** Dictionary of fields to update.
    *   **Response Body (`Dict[str, Any]`):** Updated patient data dictionary.
*   **Delete Patient:**
    *   **Method:** `DELETE`
    *   **Path:** `/api/v1/patients/{patient_id}`
    *   **Request:** Path parameter `patient_id: str`
    *   **Response:** `204 No Content`
*   **(Get List - Implied):** No explicit `/api/v1/patients/` GET endpoint was found in `patients.py` for listing all patients. This might be missing or located elsewhere. **Action:** Needs confirmation or implementation on the backend if required by the frontend.

---

## 3. Brain Models (via Digital Twins)

**Source File:** `app/presentation/api/v1/endpoints/digital_twins.py`
**Schema File:** `app/presentation/api/v1/schemas/digital_twin_schemas.py`

*   **Notes:**
    *   Brain model data is retrieved via the Digital Twin visualization endpoint.
    *   The specific response schema for the visualization data is not defined in `digital_twin_schemas.py` but returned as `Dict[str, Any]` from the service layer. Frontend needs to adapt to the actual structure returned.
*   **Get Brain Model Visualization:**
    *   **Method:** `GET`
    *   **Path:** `/api/v1/digital-twins/{patient_id}/visualization`
    *   **Request:** Path parameter `patient_id: UUID`. Optional query parameter `visualization_type: str` (defaults to `brain_model_3d`). Requires authentication.
    *   **Response Body (`Dict[str, Any]`):** Expected to contain data suitable for rendering the 3D brain model (e.g., geometry, regions, activity levels). Actual structure needs confirmation during integration.

---

## 4. Additional Findings & Data-Contract Clarifications (2024-06-XX)

### 4.1  Cookie-Centric Auth Flow

*   **HttpOnly Cookies** – The backend sets `access_token` & `refresh_token` simultaneously on a successful `/auth/login` **and** `/auth/refresh` call.  These cookies are **HttpOnly** & **Secure** (when served over HTTPS).  The frontend must therefore:
    *   Always send `withCredentials: true` on XHR / Fetch calls that require authentication.
    *   Detect a `401` from any protected endpoint and attempt **silent refresh** via `POST /api/v1/auth/refresh` before forcing user re-authentication.
*   **Token Expiry (`expires_in`)** – Although returned in the JSON body, the backend **does not** automatically extend the cookie expiry.  The frontend should rely on cookie presence/absence as source-of-truth and treat the JSON value as advisory only.

### 4.2  Patients Store Constraints

*   **In-Memory Only** – Data **does not persist** between backend restarts.  This is acceptable for Phase 1 prototyping, but the frontend must be prepared for 404s after a page reload when the backend store is empty.
*   **No List Endpoint** – The absence of `GET /patients/` means listing all patients will require either:
    1. Waiting for a backend fix *(preferred – see checklist below)*, or
    2. Maintaining a local cache / pushing IDs from another domain service.

### 4.3  Digital-Twin (Visualization) API Nuances

*   **Auth Required** – Every `/digital-twins/*` path enforces `get_current_user`; calls will fail with 401 if cookies are missing or expired.
*   **Optional Query Parameter** – Leaving `visualization_type` unset defaults to `brain_model_3d`; the backend currently ignores unrecognised values.
*   **Response Shape** – The response is an **opaque** `Dict[str, Any]`.  Early inspection of dev data reveals:

    ```json
    {
      "mesh": { "vertices": [...] , "faces": [...] },
      "regions": [{ "id": "hippocampus", "activity": 0.83 }, ...],
      "timestamp": "2024-06-05T13:47:22Z"
    }
    ```

    This shape is **not stabilised**; the frontend must implement resilient validators (e.g. Zod "passthrough") instead of strict typing at this stage.

---

## 5. Backend-Side Checklist  
*(use `[ ]` unchecked / `[x]` done markers)*

- [ ]  **Add `GET /api/v1/patients/`** – simple list endpoint returning `list(_PATIENT_STORE.values())`.
- [ ]  **Expose explicit JSON schema for Digital-Twin visualization** – at `digital_twin_schemas.py` to remove `Dict[str, Any]` ambiguity.
- [ ]  **Implement sliding-expiry on `refresh_token`** – so browser keeps session alive when refresh succeeds.
- [x]  **Confirm CORS settings** – current FastAPI app already whitelists `http://localhost:3000`.

---

*Document updated automatically by Novamind Frontend Agent – 2024-06-XX* 