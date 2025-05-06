import React, { useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form'; // SubmitHandler will be type-only
import type { SubmitHandler } from 'react-hook-form'; // Type-only import
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/infrastructure/api/authService';
import type { AuthResult } from '@/domain/types/auth/auth'; // Corrected import path for AuthResult
import { auditLogClient, AuditEventType } from '@/infrastructure/clients/auditLogClient';

// Define Zod schema for login form
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean().optional(),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

/**
 * Login page component
 * Provides secure authentication with HIPAA-compliant logging
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit', // Validate on submit
  });

  // const [email, setEmail] = useState(''); // Replaced by RHF
  // const [password, setPassword] = useState(''); // Replaced by RHF
  // const [rememberMe, setRememberMe] = useState(false); // Handled by RHF
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null); // For API errors

  // MFA state (remains the same for now)
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaValid, setMfaValid] = useState(false);

  /**
   * Handle form submission
   */
  const onSubmit: SubmitHandler<LoginFormInputs> = useCallback(
    async (data) => {
      // console.log('[Login Component] handleSubmit START with RHF data:', data);
      setApiErrorMessage(null); // Reset API error message

      try {
        flushSync(() => {
          setIsLoading(true);
        });
        
        // Ensure authService.login is typed to return Promise<AuthResult>
        const loginResult: AuthResult = await authService.login({ email: data.email, password: data.password });

        if (loginResult.success) { // No need for optional chaining if type is guaranteed
          navigate('/dashboard');
        } else {
          let errMsg = 'Authentication failed'; // Default error message
          if (loginResult.error) { // loginResult.error is defined as string in AuthResult
            errMsg = loginResult.error;
          }
          setApiErrorMessage(errMsg);
        }
      } catch (error) {
        // This catch block handles network errors or unexpected issues in authService.login itself
        setApiErrorMessage(
          error instanceof Error 
            ? error.message 
            : 'An unexpected network or system error occurred. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  /**
   * Handle MFA verification (remains the same for now)
   */
  const handleVerifyMFA = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!mfaValid) {
        setApiErrorMessage('Please enter a valid verification code');
        return;
      }

      setIsLoading(true);
      setApiErrorMessage(null);

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (mfaCode === '123456') {
          auditLogClient.log(AuditEventType.USER_SESSION_VERIFY, {
            result: 'success',
            details: 'MFA verification successful',
          });
          navigate('/');
        } else {
          auditLogClient.log(AuditEventType.USER_SESSION_VERIFY, {
            result: 'failure',
            details: 'Invalid MFA code',
          });
          throw new Error('Invalid verification code');
        }
      } catch (err) {
        setApiErrorMessage((err as Error).message);
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

        {!showMFA ? (
          <form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit(onSubmit)} // Use RHF handleSubmit
            data-testid="login-form"
            aria-label="Login form"
            noValidate // Disable browser validation, rely on Zod
          >
            {apiErrorMessage && ( // Display API error messages
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
                      {apiErrorMessage}
                    </h3>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-1 rounded-md shadow-sm"> {/* Reduced space-y for tighter field error display */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')} // Register with RHF
                  className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="provider@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="pt-2"> {/* Added padding top for spacing */}
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')} // Register with RHF
                  className={`appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  {...register('rememberMe')} // Register with RHF
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
          /* MFA form (unchanged for now) */
          <form className="mt-8 space-y-6" onSubmit={handleVerifyMFA}>
            {apiErrorMessage && ( // Also display API error message in MFA form
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30 mb-4">
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
                      {apiErrorMessage}
                    </h3>
                  </div>
                </div>
              </div>
            )}
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
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={mfaCode}
                onChange={(e) => {
                  const code = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
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
                disabled={isLoading || !mfaValid} // Also disable if mfaCode is not valid length
                className="group relative flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>

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

        {/* Security badges (unchanged) */}
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
