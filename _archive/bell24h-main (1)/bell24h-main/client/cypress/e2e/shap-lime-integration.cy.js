describe('SHAP/LIME AI Insights E2E Tests', () => {
  beforeEach(() => {
    // Visit the AI insights dashboard
    cy.visit('/dashboard/ai-insights');
  });

  it('should load supplier list and display AI insights', () => {
    // Check if the page loads correctly
    cy.get('h1').should('contain', 'AI Insights Dashboard');
    
    // Check if supplier list is loaded
    cy.get('[data-testid="supplier-list"]').should('be.visible');
    
    // Check if at least one supplier is displayed
    cy.get('[data-testid="supplier-item"]').should('have.length.greaterThan', 0);
  });

  it('should select supplier and load SHAP/LIME data', () => {
    // Click on first supplier
    cy.get('[data-testid="supplier-item"]').first().click();
    
    // Check if loading state appears
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    
    // Wait for AI insights to load
    cy.get('[data-testid="ai-insights"]', { timeout: 10000 }).should('be.visible');
    
    // Check if prediction summary is displayed
    cy.get('[data-testid="prediction-summary"]').should('be.visible');
    cy.get('[data-testid="overall-score"]').should('contain', '/10');
    cy.get('[data-testid="confidence"]').should('contain', '%');
    cy.get('[data-testid="recommendation"]').should('be.visible');
  });

  it('should display SHAP visualization correctly', () => {
    // Select a supplier
    cy.get('[data-testid="supplier-item"]').first().click();
    
    // Wait for SHAP component to load
    cy.get('[data-testid="shap-visualization"]', { timeout: 10000 }).should('be.visible');
    
    // Check if SHAP chart is rendered
    cy.get('[data-testid="shap-chart"]').should('be.visible');
    
    // Check if feature bars are displayed
    cy.get('[data-testid="feature-bar"]').should('have.length.greaterThan', 0);
    
    // Test hover interaction
    cy.get('[data-testid="feature-bar"]').first().trigger('mouseover');
    cy.get('[data-testid="feature-details"]').should('be.visible');
    
    // Test click interaction
    cy.get('[data-testid="feature-bar"]').first().click();
    cy.get('[data-testid="selected-feature"]').should('be.visible');
  });

  it('should display LIME explanation correctly', () => {
    // Select a supplier
    cy.get('[data-testid="supplier-item"]').first().click();
    
    // Wait for LIME component to load
    cy.get('[data-testid="lime-explanation"]', { timeout: 10000 }).should('be.visible');
    
    // Check if LIME explanations are displayed
    cy.get('[data-testid="lime-feature"]').should('have.length.greaterThan', 0);
    
    // Check if feature weights are shown
    cy.get('[data-testid="feature-weight"]').should('be.visible');
    
    // Test feature selection
    cy.get('[data-testid="lime-feature"]').first().click();
    cy.get('[data-testid="detailed-analysis"]').should('be.visible');
  });

  it('should handle API errors gracefully', () => {
    // Mock API error
    cy.intercept('GET', '/api/ai/explanations*', { statusCode: 500 }).as('apiError');
    
    // Select a supplier
    cy.get('[data-testid="supplier-item"]').first().click();
    
    // Wait for error to occur
    cy.wait('@apiError');
    
    // Check if error message is displayed
    cy.get('[data-testid="error-message"]').should('be.visible');
  });

  it('should refresh AI insights on demand', () => {
    // Select a supplier
    cy.get('[data-testid="supplier-item"]').first().click();
    
    // Wait for initial load
    cy.get('[data-testid="ai-insights"]', { timeout: 10000 }).should('be.visible');
    
    // Click refresh button
    cy.get('[data-testid="refresh-button"]').click();
    
    // Check if loading state appears
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    
    // Wait for refresh to complete
    cy.get('[data-testid="ai-insights"]', { timeout: 10000 }).should('be.visible');
  });

  it('should filter suppliers correctly', () => {
    // Test search functionality
    cy.get('[data-testid="search-input"]').type('Steel');
    cy.get('[data-testid="supplier-item"]').should('have.length', 1);
    cy.get('[data-testid="supplier-item"]').should('contain', 'Steel');
    
    // Clear search
    cy.get('[data-testid="search-input"]').clear();
    cy.get('[data-testid="supplier-item"]').should('have.length.greaterThan', 1);
    
    // Test status filter
    cy.get('[data-testid="status-filter"]').select('active');
    cy.get('[data-testid="supplier-item"]').should('have.length.greaterThan', 0);
  });

  it('should export AI insights data', () => {
    // Select a supplier
    cy.get('[data-testid="supplier-item"]').first().click();
    
    // Wait for AI insights to load
    cy.get('[data-testid="ai-insights"]', { timeout: 10000 }).should('be.visible');
    
    // Click export button
    cy.get('[data-testid="export-button"]').click();
    
    // Check if download is triggered
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });
  });
});
