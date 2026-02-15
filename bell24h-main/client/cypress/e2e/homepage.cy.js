// Cypress E2E Test - Homepage
// Tests the main homepage with correct unified user architecture

describe('Homepage Tests', () => {
  beforeEach(() => {
    // Visit homepage before each test
    cy.visit('/');
  });

  describe('Header Component', () => {
    it('should display Bell24h logo', () => {
      cy.contains('Bell24h').should('be.visible');
    });

    it('should have navigation links', () => {
      cy.contains('Browse RFQs').should('be.visible');
      cy.contains('Post RFQ').should('be.visible');
      cy.contains('Categories').should('be.visible');
      cy.contains('How It Works').should('be.visible');
    });

    it('should have single login button (no buyer/supplier separation)', () => {
      cy.contains('button', 'Login').should('be.visible');
      cy.contains('Sign Up Free').should('be.visible');
      
      // Should NOT have separate buyer/supplier buttons
      cy.contains('Buyer Login').should('not.exist');
      cy.contains('Supplier Login').should('not.exist');
    });

    it('should have search functionality', () => {
      cy.get('input[placeholder*="Search"]').should('be.visible');
    });
  });

  describe('Homepage Content', () => {
    it('should load homepage without errors', () => {
      cy.get('body').should('be.visible');
    });

    it('should display main content sections', () => {
      // Check for common homepage elements
      cy.get('main, [role="main"]').should('exist');
    });
  });

  describe('Footer Component', () => {
    it('should display footer', () => {
      cy.get('footer').should('be.visible');
    });

    it('should have correct sections (no buyer/supplier split)', () => {
      cy.contains('Post RFQs').should('be.visible');
      cy.contains('Respond to RFQs').should('be.visible');
      
      // Should NOT have old buyer/supplier sections
      cy.contains('For Buyers').should('not.exist');
      cy.contains('For Suppliers').should('not.exist');
    });

    it('should highlight dual role feature', () => {
      cy.contains('Every User Can Buy AND Sell').should('be.visible');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.contains('Bell24h').should('be.visible');
      
      // Mobile menu button should be visible on mobile
      cy.get('button').should('exist');
    });
  });
});

describe('OTP Login Flow', () => {
  it('should navigate to login page', () => {
    cy.visit('/');
    cy.contains('Login').click();
    cy.url().should('include', '/auth/login-otp');
  });

  it('should display OTP login form', () => {
    cy.visit('/auth/login-otp');
    cy.contains('Login', { timeout: 10000 }).should('be.visible');
  });
});

describe('Navigation', () => {
  it('should navigate to Browse RFQs', () => {
    cy.visit('/');
    cy.contains('Browse RFQs').click();
    // Should navigate to RFQ page or stay on homepage with filtered view
    cy.url().should('satisfy', (url) => {
      return url.includes('/rfq') || url === Cypress.config('baseUrl') + '/';
    });
  });

  it('should navigate to Post RFQ', () => {
    cy.visit('/');
    cy.contains('Post RFQ').click();
    cy.url().should('satisfy', (url) => {
      return url.includes('/rfq/create') || url.includes('/rfq/');
    });
  });
});

describe('Accessibility', () => {
  it('should have proper document title', () => {
    cy.visit('/');
    cy.title().should('include', 'Bell24h');
  });

  it('should have clickable navigation elements', () => {
    cy.visit('/');
    cy.contains('Login').should('not.be.disabled');
    cy.contains('Sign Up Free').should('not.be.disabled');
  });
});

