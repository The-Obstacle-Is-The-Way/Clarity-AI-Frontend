// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { authHandlers } from '../../infrastructure/mocks/handlers/authHandlers'; // Import the new handlers

// Define handlers for your API endpoints
export const handlers = [
  // Use the imported auth handlers
  ...authHandlers,

  // Remove old / duplicated auth handlers
  // http.post('/api/v1/auth/login', ...) // REMOVED
  // http.get('/api/v1/auth/me', ...) // REMOVED

  // Patient endpoints
  http.get('/api/v1/patients', () => {
    return HttpResponse.json(
      {
        data: [
          {
            id: 'patient-1',
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1980-01-01',
            gender: 'male',
            status: 'active',
          },
          {
            id: 'patient-2',
            firstName: 'Jane',
            lastName: 'Smith',
            dateOfBirth: '1985-05-15',
            gender: 'female',
            status: 'active',
          },
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          totalPages: 1,
          totalItems: 2,
        },
      },
      { status: 200 }
    );
  }),

  http.get('/api/v1/patients/:patientId', ({ params }) => {
    const { patientId } = params;
    return HttpResponse.json(
      {
        id: patientId,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
        gender: 'male',
        status: 'active',
        address: '123 Main St',
        phone: '555-123-4567',
        email: 'john.doe@example.com',
      },
      { status: 200 }
    );
  }),

  // Clinical Records endpoints
  http.get('/api/v1/patients/:patientId/records', ({ params }) => {
    return HttpResponse.json(
      {
        data: [
          {
            id: 'record-1',
            patientId: params.patientId,
            date: '2023-01-15',
            type: 'assessment',
            provider: 'Dr. Smith',
            notes: 'Patient shows improvement',
            metrics: {
              anxiety: 3,
              depression: 2,
              sleep: 4,
            },
          },
          {
            id: 'record-2',
            patientId: params.patientId,
            date: '2023-02-20',
            type: 'therapy',
            provider: 'Dr. Jones',
            notes: 'Continuing with current treatment plan',
            metrics: {
              anxiety: 2,
              depression: 2,
              sleep: 5,
            },
          },
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          totalPages: 1,
          totalItems: 2,
        },
      },
      { status: 200 }
    );
  }),

  // Analytics endpoints
  http.post('/api/v1/analytics/xgboost/predict', () => {
    return HttpResponse.json(
      {
        prediction: 0.87,
        confidence: 0.92,
        featureImportance: {
          feature1: 0.3,
          feature2: 0.25,
          feature3: 0.2,
          feature4: 0.15,
          feature5: 0.1,
        },
        classificationReport: {
          precision: 0.88,
          recall: 0.86,
          'f1-score': 0.87,
          support: 100,
        },
      },
      { status: 200 }
    );
  }),

  http.post('/api/v1/analytics/sentiment', () => {
    return HttpResponse.json(
      {
        sentiment: 'positive',
        score: 0.75,
        confidenceScores: {
          positive: 0.75,
          neutral: 0.2,
          negative: 0.05,
        },
        keyPhrases: ['good experience', 'helpful staff', 'comfortable environment'],
      },
      { status: 200 }
    );
  }),
];
