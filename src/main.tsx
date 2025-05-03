import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@presentation/templates/App';
import '@presentation/styles/index.css';
import 'react-toastify/dist/ReactToastify.css';
import 'nprogress/nprogress.css';

// Add error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Ensure the root element exists before rendering
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.warn('Root element with ID "root" not found. React app not rendered.');
}
