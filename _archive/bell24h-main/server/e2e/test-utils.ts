import { type Page, type Locator, type BrowserContext, type Browser } from '@playwright/test';
import 'dotenv/config';

// Types for test data
export interface RFQData {
  productName: string;
  description: string;
  quantity: number;
  targetPrice: number;
  unit?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  deadline?: string;
  status?: 'draft' | 'submitted' | 'matched' | 'completed';
}

export interface SupplierData {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  specialties: string[];
  rating?: number;
  status?: 'active' | 'inactive';
}

export interface UserCredentials {
  email: string;
  password: string;
  role?: 'supplier' | 'admin' | 'user';
}

// Default test user credentials
const DEFAULT_ADMIN_CREDENTIALS: UserCredentials = {
  email: process.env.PLAYWRIGHT_TEST_ADMIN_EMAIL || 'admin@example.com',
  password: process.env.PLAYWRIGHT_TEST_ADMIN_PASSWORD || 'admin1234'
};

const DEFAULT_USER_CREDENTIALS: UserCredentials = {
  email: process.env.PLAYWRIGHT_TEST_USER_EMAIL || 'user@example.com',
  password: process.env.PLAYWRIGHT_TEST_USER_PASSWORD || 'user1234'
};

/**
 * Logs in a user with the provided credentials
 * @param page - The Playwright page object
 * @param credentials - User credentials (email and password)
 * @param redirectPath - Optional path to navigate to after login
 */
export const login = async (
  page: Page, 
  credentials: UserCredentials = DEFAULT_USER_CREDENTIALS,
  redirectPath: string = '/dashboard'
): Promise<void> => {
  await test.step(`Logging in as ${credentials.email}`, async () => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(credentials.email);
    await page.getByLabel('Password').fill(credentials.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    if (redirectPath) {
      await page.waitForURL(`**${redirectPath}`);
    } else {
      await page.waitForLoadState('networkidle');
    }
  });
};

/**
 * Logs in as an admin user
 * @param page - The Playwright page object
 * @param redirectPath - Optional path to navigate to after login
 */
export const loginAsAdmin = async (
  page: Page,
  redirectPath: string = '/admin/dashboard'
): Promise<void> => {
  await login(page, DEFAULT_ADMIN_CREDENTIALS, redirectPath);
};

/**
 * Creates a new RFQ through the UI
 * @param page - The Playwright page object
 * @param rfqData - The RFQ data to create
 * @returns The ID of the created RFQ
 */
export const createTestRFQ = async (page: Page, rfqData: RFQData): Promise<string> => {
  return test.step('Create a new RFQ', async () => {
    await page.goto('/rfqs/new');
    
    // Fill in the RFQ form
    await page.getByLabel('Title').fill(rfqData.productName);
    await page.getByLabel('Description').fill(rfqData.description);
    await page.getByLabel('Quantity').fill(rfqData.quantity.toString());
    await page.getByLabel('Target Price').fill(rfqData.targetPrice.toString());
    
    if (rfqData.unit) {
      await page.getByLabel('Unit').selectOption(rfqData.unit);
    }
    
    if (rfqData.category) {
      await page.getByLabel('Category').selectOption(rfqData.category);
    }
    
    if (rfqData.priority) {
      await page.getByLabel('Priority').selectOption(rfqData.priority);
    }
    
    if (rfqData.deadline) {
      await page.getByLabel('Deadline').fill(rfqData.deadline);
    }
    
    // Submit the form
    await page.getByRole('button', { name: /Create RFQ/i }).click();
    
    // Wait for the RFQ to be created and redirected
    await page.waitForURL(/\/rfqs\/[^\/]+$/);
    
    // Return the RFQ ID from the URL
    const url = page.url();
    return url.substring(url.lastIndexOf('/') + 1);
  });
};

/**
 * Deletes an RFQ through the UI
 * @param page - The Playwright page object
 * @param rfqId - The ID of the RFQ to delete
 */
export const deleteTestRFQ = async (page: Page, rfqId: string): Promise<boolean> => {
  return test.step(`Delete RFQ with ID: ${rfqId}`, async () => {
    try {
      await page.goto(`/rfqs/${rfqId}`);
      
      // Click the delete button and confirm
      await page.getByRole('button', { name: /Delete RFQ/i }).click();
      await page.getByRole('button', { name: /Yes, delete/i }).click();
      
      // Wait for the deletion to complete and verify success message
      await expect(page.getByText('RFQ deleted successfully')).toBeVisible();
      await page.waitForURL('**/rfqs');
      return true;
    } catch (error) {
      console.error(`Failed to delete RFQ ${rfqId}:`, error);
      return false;
    }
  });
};

/**
 * Takes a screenshot of the current page and saves it with a timestamp
 * @param page - The Playwright page object
 * @param name - The name of the screenshot (without extension)
 */
export const takeScreenshot = async (page: Page, name: string): Promise<void> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = `test-results/screenshots/${name}-${timestamp}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved to: ${screenshotPath}`);
};

/**
 * Waits for a network request to complete
 * @param page - The Playwright page object
 * @param urlPattern - The URL pattern to wait for
 * @param method - The HTTP method to wait for (default: 'GET')
 */
export const waitForApiResponse = async (
  page: Page,
  urlPattern: string | RegExp,
  method: string = 'GET'
): Promise<void> => {
  await page.waitForResponse(
    (response) =>
      (typeof urlPattern === 'string' ? response.url().includes(urlPattern) : urlPattern.test(response.url())) &&
      response.request().method() === method.toUpperCase()
  );
};

/**
 * Fills a form with the provided data
 * @param page - The Playwright page object
 * @param formData - An object containing field selectors and their values
 */
export const fillForm = async (
  page: Page,
  formData: Record<string, string | number | boolean>
): Promise<void> => {
  for (const [selector, value] of Object.entries(formData)) {
    const element = page.locator(selector).first();
    const tagName = await element.evaluate((el) => el.tagName.toLowerCase());
    const inputType = await element.getAttribute('type');
    
    if (tagName === 'select') {
      await element.selectOption(String(value));
    } else if (inputType === 'checkbox' || inputType === 'radio') {
      if (value) {
        await element.check();
      } else {
        await element.uncheck();
      }
    } else {
      await element.fill(String(value));
    }
  }
};

/**
 * Creates a new browser context with saved authentication state
 * @param browser - The Playwright browser instance
 * @param storageState - Path to the storage state file
 */
export const createAuthenticatedContext = async (
  browser: Browser,
  storageState: string
): Promise<BrowserContext> => {
  return browser.newContext({
    storageState,
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: 'test-results/videos/',
      size: { width: 1280, height: 720 }
    }
  });
};

// New utility functions
export async function login(
  page: Page, 
  credentials: UserCredentials = DEFAULT_USER_CREDENTIALS,
  redirectPath: string = '/dashboard'
): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(credentials.email);
  await page.getByLabel('Password').fill(credentials.password);
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL(`**${redirectPath}`);
}

export async function loginAsAdmin(
  page: Page,
  redirectPath: string = '/admin/dashboard'
): Promise<void> {
  const adminCredentials: UserCredentials = {
    email: process.env.ADMIN_USER_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_USER_PASSWORD || 'admin123',
    role: 'admin'
  };
  await login(page, adminCredentials, redirectPath);
}

export async function createTestRFQ(page: Page, rfqData: RFQData): Promise<string> {
  await page.goto('/rfqs/new');
  await page.getByLabel('Product Name').fill(rfqData.productName);
  await page.getByLabel('Description').fill(rfqData.description);
  await page.getByLabel('Quantity').fill(rfqData.quantity.toString());
  await page.getByLabel('Target Price').fill(rfqData.targetPrice.toString());
  
  if (rfqData.unit) {
    await page.getByLabel('Unit').selectOption(rfqData.unit);
  }
  
  if (rfqData.category) {
    await page.getByLabel('Category').selectOption(rfqData.category);
  }
  
  if (rfqData.priority) {
    await page.getByLabel('Priority').selectOption(rfqData.priority);
  }
  
  if (rfqData.deadline) {
    await page.getByLabel('Deadline').fill(rfqData.deadline);
  }

  await page.getByRole('button', { name: /submit/i }).click();
  await page.waitForURL('/rfqs/**');
  
  const url = page.url();
  const rfqId = url.split('/').pop();
  if (!rfqId) {
    throw new Error('Failed to create RFQ - could not extract ID from URL');
  }
  return rfqId;
}

export async function deleteTestRFQ(page: Page, rfqId: string): Promise<boolean> {
  await page.goto(`/rfqs/${rfqId}`);
  await page.getByRole('button', { name: /delete/i }).click();
  await page.getByRole('button', { name: /confirm/i }).click();
  await page.waitForURL('/rfqs');
  return true;
}

export async function updateRFQStatus(page: Page, rfqId: string, status: RFQData['status']): Promise<void> {
  await page.goto(`/rfqs/${rfqId}`);
  await page.getByLabel('Status').selectOption(status);
  await page.getByRole('button', { name: /save/i }).click();
  await page.waitForURL(`/rfqs/${rfqId}`);
}

export async function createTestSupplier(page: Page, supplierData: SupplierData): Promise<string> {
  await page.goto('/suppliers/new');
  await page.getByLabel('Name').fill(supplierData.name);
  await page.getByLabel('Email').fill(supplierData.email);
  await page.getByLabel('Phone').fill(supplierData.phone);
  
  // Fill address
  await page.getByLabel('Street').fill(supplierData.address.street);
  await page.getByLabel('City').fill(supplierData.address.city);
  await page.getByLabel('State').fill(supplierData.address.state);
  await page.getByLabel('Zip').fill(supplierData.address.zip);
  await page.getByLabel('Country').fill(supplierData.address.country);
  
  // Fill specialties
  for (const specialty of supplierData.specialties) {
    await page.getByLabel('Specialties').selectOption(specialty);
  }
  
  if (supplierData.rating) {
    await page.getByLabel('Rating').fill(supplierData.rating.toString());
  }
  
  if (supplierData.status) {
    await page.getByLabel('Status').selectOption(supplierData.status);
  }
  
  await page.getByRole('button', { name: /submit/i }).click();
  await page.waitForURL('/suppliers/**');
  
  const url = page.url();
  const supplierId = url.split('/').pop();
  if (!supplierId) {
    throw new Error('Failed to create supplier - could not extract ID from URL');
  }
  return supplierId;
}

export async function deleteTestSupplier(page: Page, supplierId: string): Promise<boolean> {
  await page.goto(`/suppliers/${supplierId}`);
  await page.getByRole('button', { name: /delete/i }).click();
  await page.getByRole('button', { name: /confirm/i }).click();
  await page.waitForURL('/suppliers');
  return true;
}

export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true
  });
}

export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  method: string = 'GET'
): Promise<void> {
  await page.waitForResponse(response => 
    response.url().match(urlPattern) && 
    response.request().method() === method
  );
}

export async function fillForm(
  page: Page,
  formData: Record<string, string | number | boolean>
): Promise<void> {
  for (const [field, value] of Object.entries(formData)) {
    const selector = page.getByLabel(field);
    if (selector) {
      if (typeof value === 'boolean') {
        await selector.check(value);
      } else {
        await selector.fill(value.toString());
      }
    }
  }
}

export async function createAuthenticatedContext(
  browser: Browser,
  storageState: string
): Promise<BrowserContext> {
  const context = await browser.newContext({
    storageState
  });
  return context;
}

// Transaction types
export interface TransactionData {
  type: 'rfq_submission' | 'supplier_match' | 'payment' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  date: string;
  description?: string;
  referenceId?: string;
}

/**
 * Creates a new transaction through the API
 * @param page - The Playwright page object
 * @param transactionData - The transaction data to create
 * @returns The ID of the created transaction
 */
export const createTestTransaction = async (page: Page, transactionData: TransactionData): Promise<string> => {
  return test.step('Create a new transaction', async () => {
    try {
      // Create transaction via API
      const response = await page.request.post('/api/transactions', {
        data: transactionData
      });

      const transaction = await response.json();
      return transaction.id;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  });
};

/**
 * Deletes a transaction through the API
 * @param page - The Playwright page object
 * @param transactionId - The ID of the transaction to delete
 * @returns Promise resolving to boolean indicating success
 */
export const deleteTestTransaction = async (page: Page, transactionId: string): Promise<boolean> => {
  return test.step(`Delete transaction with ID: ${transactionId}`, async () => {
    try {
      const response = await page.request.delete(`/api/transactions/${transactionId}`);
      return response.ok();
    } catch (error) {
      console.error(`Failed to delete transaction ${transactionId}:`, error);
      return false;
    }
  });
};

/**
 * Updates transaction status through the API
 * @param page - The Playwright page object
 * @param transactionId - The ID of the transaction to update
 * @param status - The new status to set
 * @returns Promise resolving to boolean indicating success
 */
export const updateTransactionStatus = async (page: Page, transactionId: string, status: TransactionData['status']): Promise<boolean> => {
  return test.step(`Update transaction status to ${status}`, async () => {
    try {
      const response = await page.request.patch(`/api/transactions/${transactionId}`, {
        data: { status }
      });
      return response.ok();
    } catch (error) {
      console.error(`Failed to update transaction status ${transactionId}:`, error);
      return false;
    }
  });
};

// Export all utility functions
export * from './selectors';
export * from './api-helpers';
export * from './mocks';

// Re-export commonly used types
export type { Page, Locator, BrowserContext, Browser } from '@playwright/test';
