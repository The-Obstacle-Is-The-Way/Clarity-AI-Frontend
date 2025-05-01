describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear cookies and localStorage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should display login page', () => {
    cy.visit('/login');
    cy.get('h1').should('contain', 'Login');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show validation errors for empty form submission', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    cy.get('form').should('contain', 'required');
  });

  it('should show error message for invalid credentials', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // This assumes your app shows an error message for invalid login
    cy.get('[data-testid="login-error"]').should('be.visible');
  });

  it('should log in successfully with valid credentials', () => {
    // This test relies on having a test account or mocking the backend response
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 200,
      body: {
        access_token: 'fake-jwt-token',
        refresh_token: 'fake-refresh-token',
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'doctor'
        }
      }
    }).as('loginRequest');

    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@loginRequest');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should redirect to login when accessing protected route while unauthenticated', () => {
    cy.visit('/patients');
    cy.url().should('include', '/login');
  });

  it('should allow access to protected route when authenticated', () => {
    // Set up authentication state (token in localStorage)
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'fake-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'doctor'
      }));
    });

    cy.visit('/');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should log out successfully', () => {
    // Login first
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'fake-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'doctor'
      }));
    });

    cy.visit('/');
    
    // Find and click logout button
    cy.get('[data-testid="logout-button"]').click();
    
    // After logout, we should be redirected to login
    cy.url().should('include', '/login');
    
    // LocalStorage should be cleared
    cy.window().its('localStorage.auth_token').should('be.undefined');
  });
});