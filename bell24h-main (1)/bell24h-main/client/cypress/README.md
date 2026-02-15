# BELL24h E2E Testing

## SHAP/LIME Integration E2E Tests

This directory contains end-to-end tests for the SHAP/LIME AI insights functionality in BELL24h.

## Test Coverage

### ✅ **Tested Features:**
1. **Supplier List Loading** - Verify supplier data loads correctly
2. **Supplier Selection** - Test clicking on suppliers to view insights
3. **SHAP Visualization** - Verify SHAP charts render and are interactive
4. **LIME Explanations** - Test LIME feature explanations
5. **API Integration** - Test backend API calls for AI data
6. **Error Handling** - Verify graceful error handling
7. **Search & Filter** - Test supplier search and filtering
8. **Export Functionality** - Test data export features

### 🧪 **Test Scenarios:**
- **Happy Path**: Select supplier → Load AI insights → View SHAP/LIME
- **Error Handling**: API failures → Display error messages
- **User Interactions**: Hover, click, search, filter
- **Data Validation**: Verify correct data display and calculations

## Running Tests

### **Install Dependencies:**
```bash
npm install
```

### **Run E2E Tests:**
```bash
# Run all E2E tests
npm run e2e

# Open Cypress UI for interactive testing
npm run e2e:open

# Run specific SHAP/LIME tests
npm run cypress:run -- --spec "cypress/e2e/shap-lime-integration.cy.js"
```

### **Test Data:**
- **Mock Suppliers**: 5 test suppliers with different scores
- **SHAP Data**: 10 realistic features with impact values
- **LIME Data**: Detailed explanations for each feature
- **API Responses**: Mock endpoints returning structured data

## Test Structure

```
cypress/
├── e2e/
│   └── shap-lime-integration.cy.js    # Main E2E test file
├── fixtures/                           # Test data files
├── support/                           # Custom commands and utilities
└── cypress.config.js                  # Cypress configuration
```

## Key Test Cases

### **1. Supplier Selection Flow**
```javascript
it('should select supplier and load SHAP/LIME data', () => {
  cy.get('[data-testid="supplier-item"]').first().click();
  cy.get('[data-testid="ai-insights"]').should('be.visible');
  cy.get('[data-testid="prediction-summary"]').should('be.visible');
});
```

### **2. SHAP Visualization**
```javascript
it('should display SHAP visualization correctly', () => {
  cy.get('[data-testid="shap-visualization"]').should('be.visible');
  cy.get('[data-testid="shap-chart"]').should('be.visible');
  cy.get('[data-testid="feature-bar"]').should('have.length.greaterThan', 0);
});
```

### **3. LIME Explanations**
```javascript
it('should display LIME explanation correctly', () => {
  cy.get('[data-testid="lime-explanation"]').should('be.visible');
  cy.get('[data-testid="lime-feature"]').should('have.length.greaterThan', 0);
  cy.get('[data-testid="feature-weight"]').should('be.visible');
});
```

## Test Data Requirements

### **Mock API Endpoints:**
- `GET /api/ai/explanations?supplierId=xxx&type=both`
- Returns SHAP and LIME data for selected supplier

### **Expected Data Structure:**
```json
{
  "supplierId": "supplier-001",
  "prediction": {
    "score": 8.7,
    "confidence": 0.89,
    "recommendation": "Highly Recommended"
  },
  "shap": {
    "data": [...],
    "summary": {...}
  },
  "lime": {
    "data": [...],
    "summary": {...}
  }
}
```

## Debugging

### **View Test Results:**
- Screenshots saved to `cypress/screenshots/`
- Videos saved to `cypress/videos/`
- Test reports in terminal output

### **Common Issues:**
1. **API Timeouts**: Increase timeout in cypress.config.js
2. **Element Not Found**: Check data-testid attributes
3. **Mock Data Issues**: Verify API endpoint responses

## Continuous Integration

### **GitHub Actions:**
```yaml
- name: Run E2E Tests
  run: |
    npm run build
    npm run e2e
```

### **Vercel Integration:**
- Tests run on every deployment
- Results reported in Vercel dashboard
- Failed tests block production deployment

## Best Practices

1. **Use data-testid**: All interactive elements have test IDs
2. **Wait for Elements**: Use proper waits for async operations
3. **Mock APIs**: Use cy.intercept() for API testing
4. **Clean State**: Reset state between tests
5. **Assertions**: Verify both positive and negative cases

## Troubleshooting

### **Test Fails on CI but Passes Locally:**
- Check timeouts and waits
- Verify test data consistency
- Check environment differences

### **Elements Not Found:**
- Verify component renders correctly
- Check data-testid attributes
- Ensure proper component mounting

### **API Mock Issues:**
- Verify intercept patterns
- Check response format
- Ensure proper status codes
