describe('Analytics Features', () => {
  beforeEach(() => {
    // Set up authentication for all tests in this block
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'fake-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'doctor'
      }));
    });
  });

  describe('XGBoost Analytics', () => {
    beforeEach(() => {
      // Visit the XGBoost Analytics page
      cy.visit('/analytics/xgboost');
    });

    it('should display XGBoost form', () => {
      cy.get('[data-testid="xgboost-form"]').should('exist');
      cy.get('button[type="submit"]').should('exist');
    });

    it('should submit XGBoost prediction and display results', () => {
      // Mock the API response for XGBoost prediction
      cy.intercept('POST', '**/api/v1/analytics/xgboost/predict', {
        statusCode: 200,
        body: {
          prediction: 0.87,
          confidence: 0.92,
          featureImportance: {
            'feature1': 0.3,
            'feature2': 0.25,
            'feature3': 0.2,
            'feature4': 0.15,
            'feature5': 0.1
          },
          classificationReport: {
            'precision': 0.88,
            'recall': 0.86,
            'f1-score': 0.87,
            'support': 100
          }
        }
      }).as('xgboostPredict');

      // Fill the XGBoost input form
      cy.get('input[name="feature1"]').type('1.5');
      cy.get('input[name="feature2"]').type('2.3');
      cy.get('input[name="feature3"]').type('3.7');
      cy.get('input[name="feature4"]').type('0.8');
      cy.get('input[name="feature5"]').type('1.2');

      // Submit the form
      cy.get('[data-testid="xgboost-submit-button"]').click();
      cy.wait('@xgboostPredict');

      // Verify results are displayed
      cy.get('[data-testid="prediction-result"]').should('be.visible');
      cy.get('[data-testid="prediction-value"]').should('contain', '0.87');
      cy.get('[data-testid="confidence-value"]').should('contain', '92%');
      
      // Check feature importance visualization
      cy.get('[data-testid="feature-importance-chart"]').should('be.visible');
    });
  });

  describe('Sentiment Analysis', () => {
    beforeEach(() => {
      // Visit the Sentiment Analysis page
      cy.visit('/analytics/sentiment');
    });

    it('should display sentiment analysis form', () => {
      cy.get('[data-testid="sentiment-form"]').should('exist');
      cy.get('textarea[name="text"]').should('exist');
      cy.get('button[type="submit"]').should('exist');
    });

    it('should submit text for sentiment analysis and display results', () => {
      // Mock the API response for sentiment analysis
      cy.intercept('POST', '**/api/v1/analytics/sentiment', {
        statusCode: 200,
        body: {
          sentiment: 'positive',
          score: 0.75,
          confidenceScores: {
            positive: 0.75,
            neutral: 0.20,
            negative: 0.05
          },
          keyPhrases: [
            'good experience',
            'helpful staff',
            'comfortable environment'
          ]
        }
      }).as('sentimentAnalyze');

      // Enter text for analysis
      cy.get('textarea[name="text"]').type('I had a really good experience with the helpful staff. The environment was comfortable and welcoming.');

      // Submit the form
      cy.get('[data-testid="sentiment-submit-button"]').click();
      cy.wait('@sentimentAnalyze');

      // Verify results are displayed
      cy.get('[data-testid="sentiment-result"]').should('be.visible');
      cy.get('[data-testid="sentiment-value"]').should('contain', 'positive');
      cy.get('[data-testid="sentiment-score"]').should('contain', '75%');
      
      // Check sentiment visualization
      cy.get('[data-testid="sentiment-chart"]').should('be.visible');
      
      // Check key phrases
      cy.get('[data-testid="key-phrases"]').should('contain', 'good experience');
    });
  });
});