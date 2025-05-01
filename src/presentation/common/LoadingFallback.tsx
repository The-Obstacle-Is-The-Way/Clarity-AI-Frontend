import React from 'react';

interface LoadingFallbackProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * LoadingFallback - Common component for visualization loading states
 * Shows a loading indicator with an optional message
 */
const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading...',
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          <p className="text-foreground">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-center">
        <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        <p className="text-sm text-foreground">{message}</p>
      </div>
    </div>
  );
};

export default LoadingFallback; 