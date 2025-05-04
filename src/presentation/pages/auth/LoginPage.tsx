import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@presentation/organisms/auth';
import { useAuth } from '@application/context/AuthContext';

/**
 * Login Page
 *
 * Provides a full-page login experience with the Clarity-AI
 * digital twin platform branding
 */
export const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSuccess = () => {
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      <header className="container mx-auto p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-600 to-primary-800"></div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Clarity Digital Twin
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Need help?{' '}
            <a href="#support" className="text-primary-600 hover:underline dark:text-primary-400">
              Contact support
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-4xl rounded-xl bg-white/80 shadow-2xl backdrop-blur dark:bg-gray-800/90">
          <div className="hidden flex-1 flex-col justify-between rounded-l-xl bg-primary-600 p-10 text-white md:flex">
            <div>
              <h1 className="mb-6 text-3xl font-bold">
                Neural Analytics and Predictive Psychiatry
              </h1>
              <p className="mb-6 text-primary-100">
                The Clarity AI platform combines clinical expertise with advanced machine learning
                to create comprehensive digital twins of your patients' neural patterns.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Advanced 3D brain visualization</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Predictive treatment response</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Clinical risk assessment</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>HIPAA compliant data processing</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg bg-primary-700/50 p-4 italic">
              "The Clarity AI platform has revolutionized how we predict treatment response and
              understand neural patterns."
              <div className="mt-2 text-sm">— Dr. Sarah Chen, Chief of Psychiatry</div>
            </div>
          </div>

          <div className="flex-1 p-8 md:p-12">
            <LoginForm onSuccess={handleLoginSuccess} />
          </div>
        </div>
      </main>

      <footer className="container mx-auto p-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <div>© {new Date().getFullYear()} Clarity AI, Inc. All rights reserved.</div>
        <div className="mt-2">
          <a href="#privacy" className="mx-2 hover:text-primary-600 hover:underline">
            Privacy Policy
          </a>
          <a href="#terms" className="mx-2 hover:text-primary-600 hover:underline">
            Terms of Service
          </a>
          <a href="#compliance" className="mx-2 hover:text-primary-600 hover:underline">
            HIPAA Compliance
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
