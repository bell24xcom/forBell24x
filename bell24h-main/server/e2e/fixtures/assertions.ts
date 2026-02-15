import { expect, type Locator, type Page } from '@playwright/test';
import { RFQData } from '../test-utils';

/**
 * Collection of common assertions for Playwright tests
 */
export class Assertions {
  constructor(private page: Page) {}

  /**
   * Asserts that the current URL matches the expected path
   */
  async toBeOnPath(expectedPath: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${expectedPath}(?:\\.*)?$`));
  }

  /**
   * Asserts that the page contains a success message
   */
  async toSeeSuccessMessage(message?: string | RegExp): Promise<void> {
    const successAlert = this.page.getByRole('alert').filter({ hasText: message || /success/i });
    await expect(successAlert).toBeVisible();
  }

  /**
   * Asserts that the page contains an error message
   */
  async toSeeErrorMessage(message?: string | RegExp): Promise<void> {
    const errorAlert = this.page.getByRole('alert').filter({ hasText: message || /error/i });
    await expect(errorAlert).toBeVisible();
  }

  /**
   * Asserts that a form field shows an error message
   */
  async toSeeFieldError(fieldName: string, errorMessage?: string | RegExp): Promise<void> {
    const field = this.page.getByLabel(fieldName, { exact: true });
    const error = field.locator('..').getByText(errorMessage || /is required|invalid/i);
    await expect(error).toBeVisible();
  }

  /**
   * Asserts that an element is visible and contains the expected text
   */
  async toSeeElementWithText(selector: string | Locator, expectedText: string | RegExp): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(element).toBeVisible();
    await expect(element).toContainText(expectedText);
  }

  /**
   * Asserts that a table row contains the expected data
   */
  async toSeeTableRowWithData(rowData: Record<string, string | number | RegExp>): Promise<void> {
    const table = this.page.locator('table');
    const rows = table.locator('tbody tr');
    
    // Build a selector that matches all the expected data in a single row
    let rowSelector = 'tr';
    for (const [header, value] of Object.entries(rowData)) {
      const headerIndex = await this.getColumnIndex(header);
      if (headerIndex !== -1) {
        const cellValue = typeof value === 'string' ? value : value.source;
        rowSelector += `:has(td:nth-child(${headerIndex + 1}):text-matches("${cellValue}", "i"))`;
      }
    }
    
    await expect(rows.filter({ has: this.page.locator(rowSelector) })).toHaveCount(1);
  }

  /**
   * Asserts that an RFQ is displayed with the correct data
   */
  async toSeeRFQDetails(rfqData: RFQData): Promise<void> {
    await expect(this.page.getByText(rfqData.productName, { exact: true })).toBeVisible();
    await expect(this.page.getByText(rfqData.description)).toBeVisible();
    await expect(this.page.getByText(rfqData.quantity.toString())).toBeVisible();
    await expect(this.page.getByText(rfqData.targetPrice.toString())).toBeVisible();
    
    if (rfqData.unit) {
      await expect(this.page.getByText(rfqData.unit, { exact: true })).toBeVisible();
    }
    
    if (rfqData.priority) {
      await expect(this.page.getByText(rfqData.priority, { exact: true })).toBeVisible();
    }
  }

  /**
   * Asserts that a loading indicator is visible
   */
  async toSeeLoadingIndicator(visible: boolean = true): Promise<void> {
    const loadingIndicator = this.page.locator('.loading-indicator, [role="progressbar"], .spinner');
    
    if (visible) {
      await expect(loadingIndicator).toBeVisible();
    } else {
      await expect(loadingIndicator).toBeHidden();
    }
  }

  /**
   * Asserts that a toast notification is displayed
   */
  async toSeeToast(message: string | RegExp, type: 'success' | 'error' | 'info' | 'warning' = 'success'): Promise<void> {
    const toast = this.page.locator(`.toast.${type}`).filter({ hasText: message });
    await expect(toast).toBeVisible();
  }

  /**
   * Helper method to get the column index by header name
   */
  private async getColumnIndex(headerName: string): Promise<number> {
    const table = this.page.locator('table');
    const headers = table.locator('th');
    const count = await headers.count();
    
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).textContent();
      if (text?.toLowerCase().includes(headerName.toLowerCase())) {
        return i + 1; // +1 because CSS is 1-based
      }
    }
    
    return -1;
  }
}

/**
 * Creates a new instance of Assertions
 */
export const createAssertions = (page: Page): Assertions => new Assertions(page);

// Type exports
export type { RFQData } from '../test-utils'; // Re-export for convenience
