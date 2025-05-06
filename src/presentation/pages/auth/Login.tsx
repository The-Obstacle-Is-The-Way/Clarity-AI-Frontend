import React, { useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/infrastructure/api/authService';

// import SecureInput from "@atoms/SecureInput"; // Assume this is a styled input, replace with standard input for now
import { auditLogClient, AuditEventType } from '@infrastructure/clients/auditLogClient'; // Corrected import name

/**
 * Login page component
 * Provides secure authentication with HIPAA-compliant logging
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // MFA state
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaValid, setMfaValid] = useState(false);

  /**
   * Handle form submission
   */
  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('[Login Component] handleSubmit START');
      console.log('[Login Component] handleSubmit invoked');
      
      // Reset any previous error messages
      setErrorMessage(null);
      
      // Basic form validation
      const emailValid = email.includes('@');
      const passwordValid = password.length >= 6;
      
      console.log(`[Login Component] Checking validation: emailValid=${emailValid}, passwordValid=${passwordValid}`);
      
      if (!emailValid || !passwordValid) {
        setErrorMessage('Please enter valid credentials');
        return;
      }

      try {
        // Show loading state immediately using flushSync to ensure state update happens synchronously
        console.log('[Login Component] Setting loading state, clearing error...');
        flushSync(() => {
          setIsLoading(true);
        });
        
        console.log(`[Login Component] Calling authService.login with ${email}`);
        // Actually call the auth service
        const loginResult = await authService.login({ email, password });

        // Check result - Adjust based on actual authService response shape
        if (loginResult?.success) {
          console.log('[Login Component] authService.login successful (or requires MFA handled elsewhere)');
          navigate('/dashboard');
        } else {
          // Handle unsuccessful login but valid response
          throw new Error('Authentication failed');
        }
      } catch (error) {
        console.error('[Login Component] Caught error in handleSubmit:', error);
        setErrorMessage(
          error instanceof Error 
            ? error.message 
            : 'An unexpected error occurred. Please try again.'
        );
      } finally {
        console.log('[Login Component] handleSubmit finally block, setting isLoading false.');
        setIsLoading(false);
      }
    },
    [email, password, navigate]
  );

  /**
   * Handle MFA verification
   */
  const handleVerifyMFA = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!mfaValid) {
        setErrorMessage('Please enter a valid verification code');
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        // Simulate API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // In a real implementation, this would verify the MFA code
        if (mfaCode === '123456') {
          // Log successful MFA verification
          auditLogClient.log(AuditEventType.USER_SESSION_VERIFY, {
            // Corrected usage
            // Use appropriate type
            result: 'success',
            details: 'MFA verification successful',
          });

          // Redirect to dashboard
          navigate('/');
        } else {
          // Log failed MFA attempt
          auditLogClient.log(AuditEventType.USER_SESSION_VERIFY, {
            // Corrected usage
            // Use appropriate type
            result: 'failure',
            details: 'Invalid MFA code',
          });

          throw new Error('Invalid verification code');
        }
      } catch (err) {
        setErrorMessage((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [mfaCode, mfaValid, navigate]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Clarity-AI Digital Twin
          </h1>
          <h2 className="mt-2 text-center text-xl text-gray-600 dark:text-gray-400">
            Secure Provider Login
          </h2>
        </div>

        {/* Login form */}
        {!showMFA ? (
          <form
            className="mt-8 space-y-6"
            onSubmit={handleFormSubmit}
            data-testid="login-form"
            aria-label="Login form"
          >
            {errorMessage && (
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      {errorMessage}
                    </h3>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4 rounded-md shadow-sm">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="provider@example.com"
              />

              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 underline"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign in'}
              </button>
            </div>
          </form>
        ) : (
          /* MFA form */
          <form className="mt-8 space-y-6" onSubmit={handleVerifyMFA}>
            <div>
              <h3 className="text-center text-lg font-medium">Two-factor Authentication</h3>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Enter the verification code from your authenticator app
              </p>
            </div>

            <div className="rounded-md shadow-sm">
              <label htmlFor="mfa-code" className="sr-only">
                Verification Code
              </label>
              <input
                id="mfa-code"
                name="mfa-code"
                type="text" // Use text for easier input, consider inputMode="numeric"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={mfaCode}
                onChange={(e) => {
                  const code = e.target.value.replace(/[^0-9]/g, '').slice(0, 6); // Allow only 6 digits
                  setMfaCode(code);
                  setMfaValid(code.length === 6);
                }}
                placeholder="123456"
                maxLength={6}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-center text-lg tracking-widest"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>

            {/* Back button */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowMFA(false)}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Back to login
              </button>
            </div>
          </form>
        )}

        {/* Security badges */}
        <div className="mt-6">
          <div className="flex justify-center space-x-4">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              HIPAA Compliant
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Secure Connection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
