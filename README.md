# Clarity-AI Psychiatry Digital Twin

A premium frontend implementation for the Clarity-AI Psychiatry Digital Twin project, providing a comprehensive visualization of patient mental health profiles for clinicians in a HIPAA-compliant environment.

## Architecture

This project follows a clean architecture approach with a clear separation of concerns:

```
src/
├── domain/           # Core business logic
│   ├── models/       # Domain entities and value objects
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Pure domain utility functions
│   └── services/     # Domain service interfaces
│
├── application/      # Use cases and application logic
│   ├── hooks/        # React hooks for business logic
│   ├── services/     # Implementation of domain services
│   ├── stores/       # State management
│   └── utils/        # Application-specific utilities
│
├── infrastructure/   # External systems and tools
│   ├── api/          # API clients
│   ├── storage/      # Local storage, session storage, etc.
│   ├── auth/         # Authentication services
│   └── analytics/    # Usage tracking and analytics
│
├── presentation/     # UI layer (Atomic Design)
│   ├── providers/    # Context providers
│   ├── atoms/        # Basic UI components
│   ├── molecules/    # Combined atoms
│   ├── organisms/    # Complex UI components
│   ├── templates/    # Page layouts
│   ├── pages/        # Full pages/routes
│   └── utils/        # UI utility functions
│
└── app/              # Application bootstrap and configuration
    ├── config/       # Environment configuration
    ├── routes/       # Routing configuration
    └── main.tsx      # Entry point
```

### Import Rules

To maintain architectural boundaries and ensure a clean separation of concerns:

1. **Domain** - Contains pure business logic with no external dependencies
2. **Application** - Can import from Domain only
3. **Infrastructure** - Can import from Domain and Application
4. **Presentation** - Can import from all layers
5. **App** - Can import from all layers

## Architecture Overview

This frontend follows Clean Architecture principles with the Atomic Design pattern:

```
frontend/
├── src/
│   ├── domain/              # Business logic, interfaces, models
│   │   ├── models/          # TypeScript interfaces/types
│   │   ├── entities/        # Domain entities
│   │   └── services/        # Service interfaces
│   │
│   ├── application/         # Use cases, state management
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React Context providers
│   │   └── services/        # Application services
│   │
│   ├── infrastructure/      # External integrations
│   │   ├── api/             # API clients
│   │   ├── storage/         # Local storage
│   │   └── services/        # External service implementations
│   │
│   ├── presentation/        # UI components (React + Tailwind)
│   │   ├── atoms/           # Basic UI building blocks
│   │   ├── molecules/       # Combinations of atoms
│   │   ├── organisms/       # Complex UI sections
│   │   ├── templates/       # Page layouts
│   │   └── pages/           # Route components
```

## Core Visualization Components

### Brain Visualization

The 3D brain model visualization is a centerpiece of the frontend, allowing clinicians to:

- View brain regions with activity highlighting
- Identify neural pathways and connections
- Toggle between different visualization modes (anatomical, functional, connectivity)
- Interact with specific regions to view detailed information

### Clinical Metrics Dashboard

Comprehensive visualization of patient metrics including:

- Assessment scores with temporal trends
- Biomarker data with reference ranges
- Treatment effectiveness and adherence
- Risk assessment visualization

### XGBoost Integration

Seamless integration with the backend XGBoost service for:

- Risk prediction (relapse, suicide)
- Treatment response prediction
- Outcome forecasting
- Digital twin integration

## Design System

The UI follows a premium, concierge psychiatry experience with:

- Sleek dark theme as the default (with light mode toggle)
- Clinical precision in data presentation
- Clear confidence intervals for all predictions
- HIPAA-compliant data presentation

## Temporal Visualizations

The system provides multi-scale temporal visualizations:

- Daily/weekly/monthly views of patient data
- State transition visualization between mental health conditions
- Treatment response trajectories
- Early warning signals and critical transition points

## Biometric Integrations

Real-time visualization of biometric data:

- Physiological metrics (heart rate, sleep patterns, cortisol levels)
- Behavioral tracking (activity levels, social interactions)
- Self-reported data (mood ratings, symptom severity)
- Environmental context (weather, light exposure)

## Key Features

1. **Digital Twin Dashboard**: Central view of patient's mental health model
2. **Brain Model Viewer**: Interactive 3D brain visualization
3. **Treatment Response Predictor**: AI-powered treatment outcome simulation
4. **Risk Assessment Panel**: Visualization of risk factors and predictions
5. **Clinical Metrics Tracking**: Temporal visualization of assessment scores
6. **Biometric Correlation**: Integration of physiological and behavioral data

## Development

**Workspace Note:** This frontend project (`Clarity-AI-Frontend`) resides alongside its corresponding backend (`Clarity-AI-Backend`) within the `/Users/ray/Desktop/CLARITY-DIGITAL-TWIN` workspace. The AI development agent possesses filesystem access to both directories, enabling cross-repository checks and operations when necessary.

### Requirements

- Node.js 16+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

This project requires certain environment variables to be set. Create a `.env` file in the project root (or `.env.development` for development-specific variables).

**Required:**

-   `VITE_API_BASE_URL`: The base URL for the Clarity AI Backend API.
    -   For local development using the Vite proxy, set this to `/api`.
    -   For connecting directly to a local backend instance, use its address (e.g., `http://localhost:8000/api`).
    -   For production/staging, set this to the deployed backend API URL.

Example `.env` file:

```env
# Local development with Vite proxy
VITE_API_BASE_URL=/api
```

**Note:** Ensure your `.env` files are included in your `.gitignore` file.

### Technologies

- React 18
- TypeScript
- Tailwind CSS
- Three.js for 3D visualization
- React Query for data fetching
- D3.js for data visualization
- React Hook Form for forms
- Zod for validation
- React Toastify for notifications

## HIPAA Compliance

All visualizations follow HIPAA guidelines:

- No PHI exposure in UI or logs
- Secure data transmission
- Role-based access controls
- Audit trails for all interactions

## Project Status

This frontend implementation is ready to connect with the Clarity-AI Psychiatry Digital Twin backend services for a comprehensive psychiatric digital twin platform.

## Configuration Management

All configuration files are centralized in the `/config` directory. This includes:

- Build tools (Vite)
- Testing (Vitest)
- TypeScript
- ESLint
- PostCSS/Tailwind
- Build scripts

For detailed configuration guidelines and structure, see [Configuration Documentation](./config/README.md).

Key principles:
1. All configs live in `/config` directory
2. No nested config directories beyond one level
3. Clear naming conventions for all config files
4. Environment variables in root `.env` files
5. Configuration changes must be documented

## Root Directory Structure

The root directory contains only essential files and directories:

```
/
├── config/                # All configuration files
├── src/                  # Source code
├── public/               # Static assets
├── docs/                 # Documentation
├── scripts/              # Build and utility scripts
├── dist/                 # Build output
├── test-reports/         # Test results
├── build-analysis/       # Build analytics
├── .github/              # GitHub workflows and templates
├── .vscode/             # VS Code settings
├── node_modules/        # Dependencies (gitignored)
├── .vite/               # Vite cache (gitignored)
│
├── package.json         # Project manifest
├── package-lock.json    # Dependency lock file
├── index.html          # Entry point
├── tsconfig.json       # TypeScript config (symlink)
├── .gitignore         # Git ignore rules
├── .markdownlint.json # Markdown linting rules
├── LICENSE            # Project license
└── README.md         # Project documentation
```

Key principles:
1. No configuration files in root (except symlinks if required)
2. Only essential project files at root level
3. Build artifacts and caches are gitignored
4. Documentation and assets in dedicated directories

## Testing

### Unit & Integration Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# UI mode (interactive test runner)
npm run test:ui

# Coverage report
npm run test:coverage
```

### End-to-End (E2E) Tests

The project uses Cypress for E2E testing.

```bash
# Open Cypress interactive test runner
npm run cypress:open

# Run E2E tests in headless mode
npm run cypress:run

# Run E2E tests with dev server automatically started
npm run test:e2e:dev
```

E2E tests cover critical user flows:
- Authentication (login, logout, protected routes)
- Patient management (list, create, view, update, delete)
- Analytics features (XGBoost predictions, sentiment analysis)
