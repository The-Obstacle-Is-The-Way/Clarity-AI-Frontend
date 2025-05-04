import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * MFA Verification page component
 * Provides secure multi-factor authentication
 */
const MfaVerification: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate verification API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (verificationCode === '123456') {
        navigate('/dashboard');
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 p-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Verification Required
          </h1>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            Enter the code from your authentication app
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div>
            <label htmlFor="verificationCode" className="sr-only">
              Verification Code
            </label>
            <input
              id="verificationCode"
              name="verificationCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="block w-full rounded-md border border-gray-300 px-4 py-3 text-center text-2xl tracking-widest dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="000000"
              required
            />
          </div>
          
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white ${
                isLoading 
                  ? 'cursor-not-allowed bg-blue-400' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Back to login
            </button>
            
            <button
              type="button"
              onClick={() => alert('A new code has been sent to your authentication app')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Request new code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MfaVerification;