import { http, HttpResponse, delay } from 'msw';
import type { AuthUser, AuthTokens } from '../../auth'; // Use relative path

const BASE_URL = '/api/v1/auth'; // Or fetch from env/config

// --- Mock Data ---
const mockUser: AuthUser = {
  id: 'mock-user-123',
  username: 'testuser',
  email: 'test@example.com',
  role: 'clinician',
  permissions: ['read:patients', 'write:notes'],
};

const generateTokens = (userId: string, expiresIn = 3600 * 1000): AuthTokens => ({
  accessToken: `mock-access-token-${userId}-${Date.now()}`,
  refreshToken: `mock-refresh-token-${userId}-${Date.now()}`,
  expiresAt: Date.now() + expiresIn, // Default 1 hour
});

let currentTokens: AuthTokens | null = null;

// --- Handlers ---
export const authHandlers = [
  // Login
  http.post(`${BASE_URL}/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string } | null;

    await delay(150); // Simulate network latency

    if (body?.email === 'test@example.com' && body?.password === 'password') {
      currentTokens = generateTokens(mockUser.id);
      return HttpResponse.json(currentTokens, { status: 200 });
    } else {
      currentTokens = null;
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
  }),

  // Get Current User (/me)
  http.get(`${BASE_URL}/me`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    await delay(100);

    // Check if the token matches the current mock access token
    if (token && currentTokens && token === currentTokens.accessToken) {
      // Simple expiry check (can be made more robust)
      if (currentTokens.expiresAt > Date.now()) {
        return HttpResponse.json(mockUser, { status: 200 });
      } else {
        // Token expired
        currentTokens = null;
        return HttpResponse.json({ message: 'Token expired' }, { status: 401 });
      }
    } else {
      // No token or mismatch
      return HttpResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
  }),

  // Refresh Token
  http.post(`${BASE_URL}/refresh`, async ({ request }) => {
    const body = (await request.json()) as { refreshToken?: string } | null;

    await delay(200);

    if (
      body?.refreshToken &&
      currentTokens &&
      body.refreshToken === currentTokens.refreshToken &&
      currentTokens.expiresAt <= Date.now() // Allow refresh only if access token potentially expired
    ) {
      // In a real scenario, verify the refresh token validity/expiry separately
      currentTokens = generateTokens(mockUser.id); // Issue new tokens
      return HttpResponse.json(currentTokens, { status: 200 });
    } else {
      // Invalid refresh token or access token still valid
      currentTokens = null; // Force re-login on bad refresh
      return HttpResponse.json({ message: 'Invalid refresh token or session' }, { status: 401 });
    }
  }),

  // Logout
  http.post(`${BASE_URL}/logout`, async () => {
    await delay(50);
    currentTokens = null; // Clear tokens on logout
    // Backend might invalidate tokens here
    return HttpResponse.json({ message: 'Logout successful' }, { status: 200 });
  }),

  // Register (Basic Placeholder)
  http.post(`${BASE_URL}/register`, async () => {
    await delay(300);
    // Simulate successful registration for now
    // TODO: Add validation, user exists checks etc.
    const newUserTokens = generateTokens('new-user-456');
    currentTokens = newUserTokens;
    return HttpResponse.json(newUserTokens, { status: 201 });
  }),
];
