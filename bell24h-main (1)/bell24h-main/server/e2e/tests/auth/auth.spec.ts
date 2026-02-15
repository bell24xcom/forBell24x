import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../../test-data/factory';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { APIHelpers } from '../../api-helpers';
import { createTestUser } from '../../test-utils';
import { Role } from '../../types';

test.describe('Authentication', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let api: APIHelpers;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    api = new APIHelpers();
  });

  test('should handle successful login', async ({ page }) => {
    // Create test user
    const { user } = TestDataFactory.createScenario();
    await api.createUser(user);

    // Navigate to login page
    await page.goto('/login');
    await loginPage.waitForLoad();

    // Login with valid credentials
    await loginPage.login(user.email, user.password);

    // Verify successful login
    await dashboardPage.waitForLoad();
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Verify user menu
    const userMenu = await page.getByRole('button', { name: /user menu/i });
    await expect(userMenu).toBeVisible();
    await expect(userMenu).toHaveText(user.name);
  });

  test('should handle invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    await loginPage.waitForLoad();

    // Login with invalid credentials
    await loginPage.login('invalid@example.com', 'wrongpassword');

    // Verify error message
    const errorMessage = await page.getByText('Invalid email or password');
    await expect(errorMessage).toBeVisible();
  });

  test('should handle empty credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    await loginPage.waitForLoad();

    // Submit empty form
    await page.getByRole('button', { name: /login/i }).click();

    // Verify validation errors
    const emailError = await page.getByText('Email is required');
    await expect(emailError).toBeVisible();

    const passwordError = await page.getByText('Password is required');
    await expect(passwordError).toBeVisible();
  });

  test('should handle session expiration', async ({ page }) => {
    // Create test user
    const { user } = TestDataFactory.createScenario();
    await api.createUser(user);

    // Login
    await page.goto('/login');
    await loginPage.login(user.email, user.password);
    await dashboardPage.waitForLoad();

    // Simulate session expiration
    await page.evaluate(() => {
      localStorage.removeItem('token');
    });

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Verify redirect to login
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });

  test('should handle role-based access control', async ({ page }) => {
    // Create users with different roles
    const admin = TestDataFactory.createUser({ role: Role.Admin });
    const manager = TestDataFactory.createUser({ role: Role.Manager });
    const user = TestDataFactory.createUser({ role: Role.User });

    await api.createUser(admin);
    await api.createUser(manager);
    await api.createUser(user);

    // Test admin access
    await page.goto('/login');
    await loginPage.login(admin.email, admin.password);
    await dashboardPage.waitForLoad();

    // Verify admin-specific features
    const adminFeatures = await page.getByRole('menuitem', { name: /admin settings/i });
    await expect(adminFeatures).toBeVisible();

    // Test manager access
    await page.goto('/login');
    await loginPage.login(manager.email, manager.password);
    await dashboardPage.waitForLoad();

    // Verify manager-specific features
    const managerFeatures = await page.getByRole('menuitem', { name: /manage users/i });
    await expect(managerFeatures).toBeVisible();

    // Test user access
    await page.goto('/login');
    await loginPage.login(user.email, user.password);
    await dashboardPage.waitForLoad();

    // Verify restricted features
    const restrictedFeatures = await page.getByRole('menuitem', { name: /admin settings/i });
    await expect(restrictedFeatures).not.toBeVisible();
  });

  test('should handle logout', async ({ page }) => {
    // Create test user
    const { user } = TestDataFactory.createScenario();
    await api.createUser(user);

    // Login
    await page.goto('/login');
    await loginPage.login(user.email, user.password);
    await dashboardPage.waitForLoad();

    // Logout
    await page.getByRole('button', { name: /user menu/i }).click();
    await page.getByRole('menuitem', { name: /logout/i }).click();

    // Verify logout
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    
    // Verify token removed
    const token = await page.evaluate(() => localStorage.getItem('token'));
    await expect(token).toBeNull();
  });

  test('should handle password reset flow', async ({ page }) => {
    // Create test user
    const { user } = TestDataFactory.createScenario();
    await api.createUser(user);

    // Navigate to forgot password
    await page.goto('/login');
    await page.getByRole('link', { name: /forgot password/i }).click();

    // Enter email
    await page.getByLabel('Email').fill(user.email);
    await page.getByRole('button', { name: /send reset link/i }).click();

    // Verify success message
    const successMessage = await page.getByText('Reset link sent successfully');
    await expect(successMessage).toBeVisible();

    // Simulate clicking reset link
    await page.goto('/reset-password?token=valid-token');

    // Verify reset form
    const newPassword = await page.getByLabel('New Password');
    await expect(newPassword).toBeVisible();

    // Submit reset form
    await page.getByLabel('New Password').fill('newpassword123');
    await page.getByLabel('Confirm Password').fill('newpassword123');
    await page.getByRole('button', { name: /reset password/i }).click();

    // Verify success
    const resetSuccess = await page.getByText('Password reset successfully');
    await expect(resetSuccess).toBeVisible();
  });

  test('should handle registration flow', async ({ page }) => {
    // Navigate to registration
    await page.goto('/login');
    await page.getByRole('link', { name: /register/i }).click();

    // Fill registration form
    const userData = TestDataFactory.createUser();
    await page.getByLabel('Name').fill(userData.name);
    await page.getByLabel('Email').fill(userData.email);
    await page.getByLabel('Password').fill(userData.password);
    await page.getByLabel('Confirm Password').fill(userData.password);

    // Submit registration
    await page.getByRole('button', { name: /register/i }).click();

    // Verify success
    const successMessage = await page.getByText('Registration successful');
    await expect(successMessage).toBeVisible();

    // Verify user created
    const user = await api.getUserByEmail(userData.email);
    await expect(user).toBeDefined();
  });

  test('should handle duplicate registration', async ({ page }) => {
    // Create test user
    const { user } = TestDataFactory.createScenario();
    await api.createUser(user);

    // Navigate to registration
    await page.goto('/login');
    await page.getByRole('link', { name: /register/i }).click();

    // Try to register with existing email
    await page.getByLabel('Email').fill(user.email);
    await page.getByRole('button', { name: /register/i }).click();

    // Verify error
    const errorMessage = await page.getByText('Email already registered');
    await expect(errorMessage).toBeVisible();
  });

  test('should handle session persistence', async ({ page }) => {
    // Create test user
    const { user } = TestDataFactory.createScenario();
    await api.createUser(user);

    // Login with remember me
    await page.goto('/login');
    await page.getByLabel('Remember me').check();
    await loginPage.login(user.email, user.password);

    // Close and reopen browser
    await page.close();
    const newPage = await page.context().newPage();

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Verify still logged in
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test.afterEach(async () => {
    // Cleanup test data
    await api.cleanupTestData();
  });
});
