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

// Custom command para llenar el formulario de registro completo
Cypress.Commands.add('fillRegistrationStep1', (data: {
  idNumber: string;
  name: string;
  lastName: string;
}) => {
  cy.get('input[name="idNumber"]').clear().type(data.idNumber);
  cy.get('input[name="name"]').clear().type(data.name);
  cy.get('input[name="lastName"]').clear().type(data.lastName);
});

Cypress.Commands.add('fillRegistrationStep2', (data: {
  email: string;
  phoneNumber?: string;
}) => {
  cy.get('input[name="email"]').clear().type(data.email);
  if (data.phoneNumber) {
    cy.get('input[name="phoneNumber"]').clear().type(data.phoneNumber);
  }
});

Cypress.Commands.add('fillRegistrationStep3', (data: {
  password: string;
  confirmPassword: string;
}) => {
  cy.get('input[name="password"]').clear().type(data.password);
  cy.get('input[name="confirmPassword"]').clear().type(data.confirmPassword);
  // Hacer scroll al label del checkbox primero, luego marcar el checkbox
  cy.contains('I agree to the').scrollIntoView();
  cy.get('input[type="checkbox"]').check({ force: true });
});

// Custom command para llenar el formulario de login
Cypress.Commands.add('fillLoginForm', (data: {
  email: string;
  password: string;
}) => {
  cy.get('input[name="email"]').clear().type(data.email);
  cy.get('input[name="password"]').clear().type(data.password);
});

// Declare custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      fillRegistrationStep1(data: {
        idNumber: string;
        name: string;
        lastName: string;
      }): Chainable<void>;
      fillRegistrationStep2(data: {
        email: string;
        phoneNumber?: string;
      }): Chainable<void>;
      fillRegistrationStep3(data: {
        password: string;
        confirmPassword: string;
      }): Chainable<void>;
      fillLoginForm(data: {
        email: string;
        password: string;
      }): Chainable<void>;
    }
  }
}

export {};
