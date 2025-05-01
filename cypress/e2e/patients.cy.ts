describe('Patient Management', () => {
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

    // Mock the API response for patients list
    cy.intercept('GET', '**/api/v1/patients*', {
      statusCode: 200,
      body: {
        data: [
          {
            id: 'patient-1',
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1980-01-01',
            gender: 'male',
            status: 'active'
          },
          {
            id: 'patient-2',
            firstName: 'Jane',
            lastName: 'Smith',
            dateOfBirth: '1985-05-15',
            gender: 'female',
            status: 'active'
          }
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          totalPages: 1,
          totalItems: 2
        }
      }
    }).as('getPatients');

    // Visit the patients page
    cy.visit('/patients');
    cy.wait('@getPatients');
  });

  it('should display patient list', () => {
    cy.get('[data-testid="patient-table"]').should('exist');
    cy.get('[data-testid="patient-row"]').should('have.length', 2);
    cy.get('[data-testid="patient-row"]').first().should('contain', 'John Doe');
  });

  it('should navigate to patient detail page', () => {
    // Mock the API response for patient detail
    cy.intercept('GET', '**/api/v1/patients/patient-1', {
      statusCode: 200,
      body: {
        id: 'patient-1',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
        gender: 'male',
        status: 'active',
        address: '123 Main St',
        phone: '555-123-4567',
        email: 'john.doe@example.com',
        insuranceNumber: 'INS123456'
      }
    }).as('getPatientDetail');

    // Click on the first patient
    cy.get('[data-testid="patient-row"]').first().click();
    cy.wait('@getPatientDetail');
    
    // Verify URL and content
    cy.url().should('include', '/patients/patient-1');
    cy.get('[data-testid="patient-detail"]').should('exist');
    cy.get('[data-testid="patient-name"]').should('contain', 'John Doe');
  });

  it('should create a new patient', () => {
    // Mock the API response for creating a patient
    cy.intercept('POST', '**/api/v1/patients', {
      statusCode: 201,
      body: {
        id: 'new-patient-id',
        firstName: 'New',
        lastName: 'Patient',
        dateOfBirth: '1990-10-10',
        gender: 'female',
        status: 'active'
      }
    }).as('createPatient');

    // Navigate to create patient page
    cy.get('[data-testid="create-patient-button"]').click();
    cy.url().should('include', '/patients/new');

    // Fill the form
    cy.get('input[name="firstName"]').type('New');
    cy.get('input[name="lastName"]').type('Patient');
    cy.get('input[name="dateOfBirth"]').type('1990-10-10');
    cy.get('select[name="gender"]').select('female');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    cy.wait('@createPatient');

    // Should redirect to the patient list
    cy.url().should('include', '/patients');
  });

  it('should update patient information', () => {
    // Mock the API response for patient detail
    cy.intercept('GET', '**/api/v1/patients/patient-1', {
      statusCode: 200,
      body: {
        id: 'patient-1',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
        gender: 'male',
        status: 'active',
        address: '123 Main St',
        phone: '555-123-4567',
        email: 'john.doe@example.com'
      }
    }).as('getPatientDetail');

    // Mock the API response for updating a patient
    cy.intercept('PUT', '**/api/v1/patients/patient-1', {
      statusCode: 200,
      body: {
        id: 'patient-1',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
        gender: 'male',
        status: 'active',
        address: '456 New Address',
        phone: '555-123-4567',
        email: 'john.doe@example.com'
      }
    }).as('updatePatient');

    // Navigate to patient detail
    cy.get('[data-testid="patient-row"]').first().click();
    cy.wait('@getPatientDetail');

    // Click edit button
    cy.get('[data-testid="edit-patient-button"]').click();
    
    // Update address
    cy.get('input[name="address"]').clear().type('456 New Address');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    cy.wait('@updatePatient');

    // Verify the update
    cy.get('[data-testid="patient-address"]').should('contain', '456 New Address');
  });

  it('should delete a patient', () => {
    // Mock the API response for patient detail
    cy.intercept('GET', '**/api/v1/patients/patient-1', {
      statusCode: 200,
      body: {
        id: 'patient-1',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
        gender: 'male',
        status: 'active'
      }
    }).as('getPatientDetail');

    // Mock the API response for deleting a patient
    cy.intercept('DELETE', '**/api/v1/patients/patient-1', {
      statusCode: 204
    }).as('deletePatient');

    // Navigate to patient detail
    cy.get('[data-testid="patient-row"]').first().click();
    cy.wait('@getPatientDetail');

    // Click delete button
    cy.get('[data-testid="delete-patient-button"]').click();
    
    // Confirm deletion in the modal
    cy.get('[data-testid="confirm-delete-button"]').click();
    cy.wait('@deletePatient');

    // Should redirect to the patient list
    cy.url().should('include', '/patients');
    
    // Refresh the patient list after deletion
    cy.intercept('GET', '**/api/v1/patients*', {
      statusCode: 200,
      body: {
        data: [
          {
            id: 'patient-2',
            firstName: 'Jane',
            lastName: 'Smith',
            dateOfBirth: '1985-05-15',
            gender: 'female',
            status: 'active'
          }
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          totalPages: 1,
          totalItems: 1
        }
      }
    }).as('getPatientsAfterDelete');
    
    cy.visit('/patients');
    cy.wait('@getPatientsAfterDelete');
    
    // Verify patient was deleted
    cy.get('[data-testid="patient-row"]').should('have.length', 1);
    cy.get('[data-testid="patient-row"]').should('not.contain', 'John Doe');
  });
});