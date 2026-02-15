describe('Simple E2E Test', () => {
  it('should load the home page', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });

  it('should have a title', () => {
    cy.visit('/');
    cy.title().should('contain', 'Bell24h');
  });
});
