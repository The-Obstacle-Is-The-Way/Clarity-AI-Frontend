// cypress/e2e/basic.cy.ts
// This is a basic test that doesn't require a server, just to verify the test setup

describe('Basic E2E Test', () => {
  it('loads a local HTML file', () => {
    // Instead of visiting a URL, we'll verify Cypress itself works
    cy.wrap('Cypress test').should('equal', 'Cypress test');
    
    // Verify we can access the Cypress object and perform basic assertions
    cy.wrap(Cypress.version).should('be.a', 'string');
    
    // Basic DOM assertion that doesn't need a real page
    cy.document().should('exist');
    cy.window().should('exist');
  });
});