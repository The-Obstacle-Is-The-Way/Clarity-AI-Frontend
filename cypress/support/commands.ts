/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Cypress login command for reuse across tests
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  // Wait for redirect after successful login
  cy.url().should('not.include', '/login');
});

// Navigate to patient list page
Cypress.Commands.add('navigateToPatientList', () => {
  cy.get('a[href="/patients"]').click();
  cy.url().should('include', '/patients');
});

// Command to access a patient detail page by ID
Cypress.Commands.add('viewPatientDetail', (patientId: string) => {
  cy.visit(`/patients/${patientId}`);
  cy.url().should('include', `/patients/${patientId}`);
});

// Command to check if we're authenticated
Cypress.Commands.add('isAuthenticated', () => {
  // Check for presence of user info in header or navigation
  cy.get('[data-testid="user-profile"]').should('exist');
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      navigateToPatientList(): Chainable<void>;
      viewPatientDetail(patientId: string): Chainable<void>; 
      isAuthenticated(): Chainable<void>;
    }
  }
}

export {};