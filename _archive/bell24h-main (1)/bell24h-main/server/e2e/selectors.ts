// Common selectors used across tests
export const selectors = {
  // Auth
  emailInput: 'input[type="email"]',
  passwordInput: 'input[type="password"]',
  loginButton: 'button:has-text("Sign In")',
  logoutButton: 'button:has-text("Logout")',
  
  // Navigation
  dashboardLink: 'a[href="/dashboard"]',
  rfqsLink: 'a[href^="/rfqs"]',
  newRfqButton: 'button:has-text("New RFQ")',
  
  // RFQ Form
  rfqForm: 'form',
  rfqTitle: '#title',
  rfqDescription: '#description',
  rfqQuantity: '#quantity',
  rfqTargetPrice: '#targetPrice',
  rfqUnit: '#unit',
  rfqCategory: '#category',
  rfqPriority: '#priority',
  rfqDeadline: '#deadline',
  submitButton: 'button[type="submit"]',
  
  // Alerts & Notifications
  successAlert: '.alert-success',
  errorAlert: '.alert-error',
  infoAlert: '.alert-info',
  
  // Tables
  dataTable: 'table',
  tableRow: 'tbody tr',
  tableCell: 'td',
  
  // Modals
  modal: '.modal',
  confirmButton: 'button:has-text("Confirm")',
  cancelButton: 'button:has-text("Cancel")',
  
  // Pagination
  pagination: '.pagination',
  nextPage: 'button:has-text("Next")',
  prevPage: 'button:has-text("Previous")',
  
  // Loading states
  loadingSpinner: '.spinner',
  skeletonLoader: '.skeleton',
} as const;

// Type for the selectors object
export type Selectors = typeof selectors;

// Helper function to get a selector with a test ID
export const byTestId = (testId: string): string => `[data-testid="${testId}"]`;

// Helper function to get a selector with a role
export const byRole = (role: string, name?: string): string => {
  return name ? `[role="${role}"][name="${name}"]` : `[role="${role}"]`;
};

// Helper function to get a selector with an ARIA label
export const byAriaLabel = (label: string): string => `[aria-label="${label}"]`;
