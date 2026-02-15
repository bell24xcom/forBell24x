import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('http://localhost:3000/login');
  });

  test('should display login form', async ({ page }) => {
    // Check if the login form is visible
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for validation errors
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Mock the API response for failed login
    await page.route('**/api/auth/callback/credentials*', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid credentials' })
      });
    });

    // Fill in invalid credentials
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check for error message
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('should redirect to dashboard on successful login', async ({ page }) => {
    // Mock the API response for successful login
    await page.route('**/api/auth/callback/credentials*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          user: { 
            id: '1', 
            name: 'Test User', 
            email: 'test@example.com',
            role: 'user'
          } 
        })
      });
    });

    // Mock the session API
    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          user: { 
            id: '1', 
            name: 'Test User', 
            email: 'test@example.com',
            role: 'user'
          },
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
        })
      });
    });

    // Fill in valid credentials
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check if redirected to dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    await expect(page.getByText('Welcome, Test User')).toBeVisible();
  });
});
