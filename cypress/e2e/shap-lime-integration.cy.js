describe('SHAP/LIME integration', () => {
  it('renders SHAP bars and LIME explanations (mock or live)', () => {
    const mock = [
      { feature: 'price', importance: 0.34, contribution: 'positive' },
      { feature: 'delivery', importance: 0.21, contribution: 'positive' },
      { feature: 'quality', importance: 0.15, contribution: 'positive' },
      { feature: 'compliance', importance: 0.12, contribution: 'positive' }
    ]

    const live = Cypress.env('LIVE_API') === true || Cypress.env('LIVE_API') === 'true'
    // Always intercept the POST and alias it; stub only in non-live mode.
    if (live) {
      cy.intercept('POST', '/api/v1/ai/explain-match/1').as('explain')
    } else {
      cy.intercept('POST', '/api/v1/ai/explain-match/1', { body: { explanations: mock } }).as('explain')
    }

  // Visit the demo page. Prefer BASE_URL when provided; otherwise use our
  // confirmed dev server at port 8002 which was started by the test harness.
  const base = Cypress.env('BASE_URL') || Cypress.config('baseUrl') || 'http://127.0.0.1:8002'
  cy.visit(`${base.replace(/\/$/, '')}/public/ai-insights.html`)
  // Wait for the explain request to complete (works for both mocked and live)
  cy.wait('@explain', { timeout: 10000 })
  // verify mocked or live content appears via data-testid
  cy.get('[data-testid=feature-0]').should('exist').and('contain', 'price')
  cy.get('[data-testid=feature-1]').should('exist').and('contain', 'delivery')
  })
})
