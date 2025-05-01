// src/test/jest-dom-setup.ts
// This must be imported before any tests that use @testing-library/jest-dom matchers

// Import the jest-dom matchers to extend expect
import '@testing-library/jest-dom';

// Note: Since globals: true is set in vitest.config.ts, Vitest will automatically
// make 'expect' available globally, and @testing-library/jest-dom will extend it 