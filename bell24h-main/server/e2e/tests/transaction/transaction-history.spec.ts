import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../../test-data/factory';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { TransactionPage } from '../../pages/transaction.page';
import { APIHelpers } from '../../api-helpers';
import { createTestTransaction } from '../../test-utils';
import { TransactionType, TransactionStatus } from '../../types';

test.describe('Transaction History', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let transactionPage: TransactionPage;
  let api: APIHelpers;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    transactionPage = new TransactionPage(page);
    api = new APIHelpers();

    // Create test user
    const { user } = TestDataFactory.createScenario();
    await api.createUser(user);

    // Login
    await loginPage.login(user.email, user.password);
    await dashboardPage.waitForLoad();
  });

  test('should display transaction logs', async ({ page }) => {
    // Create test transactions
    const transactions = [
      {
        type: TransactionType.RFQ_SUBMISSION,
        status: TransactionStatus.COMPLETED,
        amount: 10000,
        date: new Date(Date.now()).toISOString(),
        description: 'RFQ #1234 submission'
      },
      {
        type: TransactionType.SUPPLIER_MATCH,
        status: TransactionStatus.PENDING,
        amount: 5000,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'Supplier matching for RFQ #1234'
      }
    ];

    for (const transaction of transactions) {
      await createTestTransaction(page, transaction);
    }

    // Navigate to transaction history
    await page.goto('/transactions');
    await transactionPage.waitForLoad();

    // Verify transaction list
    const transactionList = await page.getByRole('list');
    await expect(transactionList).toBeVisible();

    // Verify transaction details
    const firstTransaction = await transactionList.getByRole('listitem').first();
    await expect(firstTransaction.getByText('RFQ #1234 submission')).toBeVisible();
    await expect(firstTransaction.getByText('₹10,000')).toBeVisible();
    await expect(firstTransaction.getByText('Completed')).toBeVisible();

    const secondTransaction = await transactionList.getByRole('listitem').nth(1);
    await expect(secondTransaction.getByText('Supplier matching for RFQ #1234')).toBeVisible();
    await expect(secondTransaction.getByText('₹5,000')).toBeVisible();
    await expect(secondTransaction.getByText('Pending')).toBeVisible();
  });

  test('should handle transaction filtering', async ({ page }) => {
    // Create test transactions
    const transactions = [
      {
        type: TransactionType.RFQ_SUBMISSION,
        status: TransactionStatus.COMPLETED,
        amount: 10000,
        date: new Date(Date.now()).toISOString(),
        description: 'RFQ #1234 submission'
      },
      {
        type: TransactionType.SUPPLIER_MATCH,
        status: TransactionStatus.PENDING,
        amount: 5000,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'Supplier matching for RFQ #1234'
      }
    ];

    for (const transaction of transactions) {
      await createTestTransaction(page, transaction);
    }

    // Navigate to transaction history
    await page.goto('/transactions');
    await transactionPage.waitForLoad();

    // Filter by type
    await transactionPage.selectFilter('type', TransactionType.RFQ_SUBMISSION);
    await expect(page.getByText('RFQ #1234 submission')).toBeVisible();
    await expect(page.getByText('Supplier matching for RFQ #1234')).not.toBeVisible();

    // Filter by status
    await transactionPage.selectFilter('status', TransactionStatus.COMPLETED);
    await expect(page.getByText('RFQ #1234 submission')).toBeVisible();
    await expect(page.getByText('Supplier matching for RFQ #1234')).not.toBeVisible();

    // Filter by date range
    await transactionPage.selectDateRange('last_7_days');
    await expect(page.getByText('RFQ #1234 submission')).toBeVisible();
    await expect(page.getByText('Supplier matching for RFQ #1234')).not.toBeVisible();
  });

  test('should handle transaction sorting', async ({ page }) => {
    // Create test transactions with different amounts
    const transactions = [
      {
        type: TransactionType.RFQ_SUBMISSION,
        status: TransactionStatus.COMPLETED,
        amount: 10000,
        date: new Date(Date.now()).toISOString(),
        description: 'RFQ #1234 submission'
      },
      {
        type: TransactionType.SUPPLIER_MATCH,
        status: TransactionStatus.PENDING,
        amount: 5000,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'Supplier matching for RFQ #1234'
      }
    ];

    for (const transaction of transactions) {
      await createTestTransaction(page, transaction);
    }

    // Navigate to transaction history
    await page.goto('/transactions');
    await transactionPage.waitForLoad();

    // Sort by amount (ascending)
    await transactionPage.clickSort('amount', 'asc');
    const firstTransaction = await page.getByRole('listitem').first();
    await expect(firstTransaction.getByText('₹5,000')).toBeVisible();

    // Sort by amount (descending)
    await transactionPage.clickSort('amount', 'desc');
    const newFirstTransaction = await page.getByRole('listitem').first();
    await expect(newFirstTransaction.getByText('₹10,000')).toBeVisible();

    // Sort by date
    await transactionPage.clickSort('date', 'desc');
    const dateFirstTransaction = await page.getByRole('listitem').first();
    await expect(dateFirstTransaction.getByText('RFQ #1234 submission')).toBeVisible();
  });

  test('should handle transaction export formats', async ({ page }) => {
    // Create test transactions with metadata
    const transactions = [
      {
        type: TransactionType.RFQ_SUBMISSION,
        status: TransactionStatus.COMPLETED,
        amount: 10000,
        date: new Date(Date.now()).toISOString(),
        description: 'RFQ #1234 submission',
        metadata: {
          rfqId: '1234',
          supplierId: '5678',
          quantity: 100,
          unit: 'units',
          category: 'electronics'
        }
      },
      {
        type: TransactionType.SUPPLIER_MATCH,
        status: TransactionStatus.PENDING,
        amount: 5000,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'Supplier matching for RFQ #1234',
        metadata: {
          rfqId: '1234',
          supplierId: '5678',
          quantity: 100,
          unit: 'units',
          category: 'electronics'
        }
      }
    ];

    for (const transaction of transactions) {
      await createTestTransaction(page, transaction);
    }

    // Navigate to transaction history
    await page.goto('/transactions');
    await transactionPage.waitForLoad();

    // Export to PDF with validation
    await transactionPage.clickExport('pdf');
    await expect(page.getByText('PDF export successful')).toBeVisible();
    const pdfExport = await page.getByRole('dialog', { name: /pdf export/i });
    await expect(pdfExport.getByText('Page 1 of 1')).toBeVisible();
    await expect(pdfExport.getByText('RFQ #1234 submission')).toBeVisible();
    await expect(pdfExport.getByText('₹10,000')).toBeVisible();

    // Export to Excel with validation
    await transactionPage.clickExport('excel');
    await expect(page.getByText('Excel export successful')).toBeVisible();
    const excelExport = await page.getByRole('dialog', { name: /excel export/i });
    await expect(excelExport.getByText('Sheet1')).toBeVisible();
    await expect(excelExport.getByText('A1:RFQ #1234 submission')).toBeVisible();
    await expect(excelExport.getByText('B1:₹10,000')).toBeVisible();

    // Export to CSV with validation
    await transactionPage.clickExport('csv');
    await expect(page.getByText('CSV export successful')).toBeVisible();
    const csvExport = await page.getByRole('dialog', { name: /csv export/i });
    await expect(csvExport.getByText('"Description","Amount"')).toBeVisible();
    await expect(csvExport.getByText('"RFQ #1234 submission","10000"')).toBeVisible();

    // Test export with filters
    await transactionPage.selectFilter('type', TransactionType.RFQ_SUBMISSION);
    await transactionPage.clickExport('pdf');
    await expect(page.getByText('PDF export successful')).toBeVisible();
    const filteredExport = await page.getByRole('dialog', { name: /pdf export/i });
    await expect(filteredExport.getByText('Filtered by: RFQ Submission')).toBeVisible();

    // Test export with date range
    await transactionPage.selectDateRange('last_7_days');
    await transactionPage.clickExport('excel');
    await expect(page.getByText('Excel export successful')).toBeVisible();
    const dateRangeExport = await page.getByRole('dialog', { name: /excel export/i });
    await expect(dateRangeExport.getByText('Date Range: Last 7 days')).toBeVisible();

    // Test export with large dataset
    const largeTransactions = Array.from({ length: 1000 }, (_, i) => ({
      type: TransactionType.RFQ_SUBMISSION,
      status: TransactionStatus.COMPLETED,
      amount: 1000 + i * 100,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      description: `RFQ #${i + 1} submission`
    }));

    for (const tx of largeTransactions) {
      await createTestTransaction(page, tx);
    }

    await transactionPage.clickExport('excel');
    await expect(page.getByText('Exporting large dataset, this may take a while...')).toBeVisible();
    await expect(page.getByText('Excel export successful')).toBeVisible();
  });

  test('should handle complex status transitions', async ({ page }) => {
    // Create test transaction
    const transaction = {
      type: TransactionType.RFQ_SUBMISSION,
      status: TransactionStatus.PENDING,
      amount: 10000,
      date: new Date(Date.now()).toISOString(),
      description: 'RFQ #1234 submission',
      metadata: {
        rfqId: '1234',
        supplierId: '5678',
        quantity: 100,
        unit: 'units',
        category: 'electronics'
      }
    };

    const transactionId = await createTestTransaction(page, transaction);

    // Navigate to transaction history
    await page.goto('/transactions');
    await transactionPage.waitForLoad();

    // Test complex status flow
    await transactionPage.updateStatus(transactionId, TransactionStatus.APPROVED);
    await expect(page.getByText('Transaction status updated to Approved')).toBeVisible();

    await transactionPage.updateStatus(transactionId, TransactionStatus.IN_PROGRESS);
    await expect(page.getByText('Transaction status updated to In Progress')).toBeVisible();

    await transactionPage.updateStatus(transactionId, TransactionStatus.COMPLETED);
    await expect(page.getByText('Transaction status updated to Completed')).toBeVisible();

    // Test status history with comments
    await transactionPage.viewStatusHistory(transactionId);
    const statusHistory = await page.getByRole('list', { name: /status history/i });
    await expect(statusHistory.getByText('Pending → Approved')).toBeVisible();
    await expect(statusHistory.getByText('Approved → In Progress')).toBeVisible();
    await expect(statusHistory.getByText('In Progress → Completed')).toBeVisible();

    // Test status transition with comments
    await transactionPage.addStatusComment(transactionId, 'Approved by manager');
    await expect(page.getByText('Approved by manager')).toBeVisible();

    // Test status transition with attachments
    await transactionPage.addStatusAttachment(transactionId, 'approval.pdf');
    const attachment = await page.getByRole('link', { name: /approval.pdf/i });
    await expect(attachment).toBeVisible();

    // Test status transition notifications
    const notifications = await page.getByRole('list', { name: /notifications/i });
    await expect(notifications.getByText('Transaction status updated to Approved')).toBeVisible();
    await expect(notifications.getByText('Transaction status updated to In Progress')).toBeVisible();
    await expect(notifications.getByText('Transaction status updated to Completed')).toBeVisible();

    // Test status transition timestamps
    const timestamps = await statusHistory.getByRole('cell', { name: /timestamp/i });
    await expect(timestamps).toHaveCount(3);
    
    // Test status transition by different users
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({ id: 'user1', name: 'Manager' }));
    });
    await transactionPage.updateStatus(transactionId, TransactionStatus.APPROVED);
    await expect(page.getByText('Status updated by Manager')).toBeVisible();

    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({ id: 'user2', name: 'Admin' }));
    });
    await transactionPage.updateStatus(transactionId, TransactionStatus.COMPLETED);
    await expect(page.getByText('Status updated by Admin')).toBeVisible();

    // Test status transition with audit trail
    const auditTrail = await page.getByRole('list', { name: /audit trail/i });
    await expect(auditTrail.getByText('Manager updated status to Approved')).toBeVisible();
    await expect(auditTrail.getByText('Admin updated status to Completed')).toBeVisible();
  });

  test('should validate metadata rules', async ({ page }) => {
    // Test metadata validation rules
    const validationRules = [
      // Required fields
      {
        description: 'Required fields validation',
        data: {
          rfqId: '', // required
          supplierId: '', // required
          quantity: 0, // required
          unit: '' // required
        },
        expectedErrors: [
          'rfqId is required',
          'supplierId is required',
          'quantity must be greater than 0',
          'unit is required'
        ]
      },

      // Format validation
      {
        description: 'Format validation',
        data: {
          rfqId: 'invalid-id', // should be numeric
          supplierId: 'supplier!', // special characters not allowed
          quantity: '100.5', // should be integer
          unit: 'invalid_unit' // not in allowed list
        },
        expectedErrors: [
          'rfqId must be numeric',
          'supplierId contains invalid characters',
          'quantity must be an integer',
          'unit must be one of: units, pieces, kg, lbs'
        ]
      },

      // Range validation
      {
        description: 'Range validation',
        data: {
          quantity: 1000000, // max 100000
          amount: 100000000, // max 10000000
          leadTime: 365, // max 180 days
          deliveryTime: -1 // must be positive
        },
        expectedErrors: [
          'quantity must be less than or equal to 100000',
          'amount must be less than or equal to 10000000',
          'leadTime must be less than or equal to 180',
          'deliveryTime must be greater than 0'
        ]
      },

      // Date validation
      {
        description: 'Date validation',
        data: {
          deadline: '2020-01-01', // must be future date
          deliveryDate: '2025-05-23', // must be after deadline
          createdAt: 'invalid-date' // invalid format
        },
        expectedErrors: [
          'deadline must be a future date',
          'deliveryDate must be after deadline',
          'createdAt must be in YYYY-MM-DD format'
        ]
      },

      // Reference validation
      {
        description: 'Reference validation',
        data: {
          rfqId: '1234',
          poId: '5678',
          invoiceId: 'INV123'
        },
        expectedErrors: [
          'rfqId does not exist',
          'poId does not exist',
          'invoiceId does not exist'
        ]
      },

      // Status validation
      {
        description: 'Status validation',
        data: {
          status: 'invalid_status', // must be valid status
          previousStatus: 'PENDING', // must be valid transition
          nextStatus: 'COMPLETED' // must be valid transition
        },
        expectedErrors: [
          'invalid_status is not a valid status',
          'invalid status transition',
          'invalid next status'
        ]
      }
    ];

    // Test each validation rule
    for (const { description, data, expectedErrors } of validationRules) {
      const transaction = {
        type: TransactionType.RFQ_SUBMISSION,
        status: TransactionStatus.PENDING,
        amount: 10000,
        date: new Date(Date.now()).toISOString(),
        description: `Test ${description}`,
        metadata: data
      };

      await createTestTransaction(page, transaction);
      
      // Verify validation errors
      for (const error of expectedErrors) {
        await expect(page.getByText(error)).toBeVisible();
      }
    }

    // Test validation success
    const validTransaction = {
      type: TransactionType.RFQ_SUBMISSION,
      status: TransactionStatus.PENDING,
      amount: 10000,
      date: new Date(Date.now()).toISOString(),
      description: 'Valid transaction',
      metadata: {
        rfqId: '1234',
        supplierId: '5678',
        quantity: 100,
        unit: 'units',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    };

    const transactionId = await createTestTransaction(page, validTransaction);
    await expect(page.getByText('Transaction created successfully')).toBeVisible();

    // Test validation during update
    await transactionPage.updateMetadata(transactionId, {
      quantity: -50 // invalid value
    });
    await expect(page.getByText('quantity must be greater than 0')).toBeVisible();
  });

  test('should manage transaction lifecycle', async ({ page }) => {
    // Create test transaction
    const transaction = {
      type: TransactionType.RFQ_SUBMISSION,
      status: TransactionStatus.PENDING,
      amount: 10000,
      date: new Date(Date.now()).toISOString(),
      description: 'Test transaction'
    };

    const transactionId = await createTestTransaction(page, transaction);

    // Test lifecycle transitions
    await transactionPage.updateStatus(transactionId, TransactionStatus.APPROVED);
    await expect(page.getByText('Transaction status updated to Approved')).toBeVisible();

    await transactionPage.updateStatus(transactionId, TransactionStatus.IN_PROGRESS);
    await expect(page.getByText('Transaction status updated to In Progress')).toBeVisible();

    await transactionPage.updateStatus(transactionId, TransactionStatus.COMPLETED);
    await expect(page.getByText('Transaction status updated to Completed')).toBeVisible();

    // Test invalid transitions
    await transactionPage.updateStatus(transactionId, TransactionStatus.PENDING);
    await expect(page.getByText('Invalid status transition: COMPLETED → PENDING')).toBeVisible();

    // Test lifecycle events
    await transactionPage.viewLifecycleEvents(transactionId);
    const events = await page.getByRole('list', { name: /lifecycle events/i });
    await expect(events.getByText('Created')).toBeVisible();
    await expect(events.getByText('Approved')).toBeVisible();
    await expect(events.getByText('Started')).toBeVisible();
    await expect(events.getByText('Completed')).toBeVisible();

    // Test lifecycle validation
    await transactionPage.validateLifecycle(transactionId);
    await expect(page.getByText('Lifecycle validation passed')).toBeVisible();

    // Test lifecycle history
    await transactionPage.viewLifecycleHistory(transactionId);
    const history = await page.getByRole('list', { name: /lifecycle history/i });
    await expect(history.getByText('Created by')).toBeVisible();
    await expect(history.getByText('Approved by')).toBeVisible();
    await expect(history.getByText('Started by')).toBeVisible();
    await expect(history.getByText('Completed by')).toBeVisible();

    // Test lifecycle timing
    const timestamps = await page.getByRole('cell', { name: /timestamp/i });
    await expect(timestamps).toHaveCount(4); // Created, Approved, Started, Completed

    // Test lifecycle state
    await transactionPage.viewLifecycleState(transactionId);
    const state = await page.getByRole('list', { name: /lifecycle state/i });
    await expect(state.getByText('Current Status: COMPLETED')).toBeVisible();
    await expect(state.getByText('Duration:')).toBeVisible();
    await expect(state.getByText('Total Time:')).toBeVisible();
  });

  test('should handle transaction edge cases', async ({ page }) => {
    // Test with minimum values
    const minTransaction = {
      type: TransactionType.RFQ_SUBMISSION,
      status: TransactionStatus.PENDING,
      amount: 0.01, // minimum amount
      date: new Date('1970-01-01T00:00:00.000Z').toISOString(), // earliest date
      description: 'A'.repeat(1), // min length
      metadata: {
        id: '1',
        count: 1
      }
    };

    const minId = await createTestTransaction(page, minTransaction);
    await expect(page.getByText('Transaction created successfully')).toBeVisible();

    // Test with maximum values
    const maxTransaction = {
      type: TransactionType.PAYMENT,
      status: TransactionStatus.COMPLETED,
      amount: 9999999999.99, // max amount
      date: new Date('2038-01-19T03:14:07.000Z').toISOString(), // max date
      description: 'A'.repeat(1000), // max length
      metadata: {
        id: '9'.repeat(50), // max length
        count: 2147483647, // max int
        largeArray: Array(1000).fill({ key: 'value' }), // large array
        nested: {
          level1: { level2: { level3: { level4: { level5: 'deep' } } } } // deep nesting
        }
      }
    };

    const maxId = await createTestTransaction(page, maxTransaction);
    await expect(page.getByText('Transaction created successfully')).toBeVisible();

    // Test with special characters
    const specialCharTransaction = {
      type: TransactionType.RFQ_SUBMISSION,
      status: TransactionStatus.PENDING,
      amount: 100,
      date: new Date().toISOString(),
      description: 'Special chars: !@#$%^&*()_+{}[]|\\:;\'\"<>,.?/~`',
      metadata: {
        special: '!@#$%^&*()_+{}[]|\\:;\'\"<>,.?/~`',
        emoji: '😊🚀👍',
        unicode: '你好世界',
        html: '<script>alert(\'xss\')</script>',
        sql: 'SELECT * FROM users; DROP TABLE users;'
      }
    };

    const specialId = await createTestTransaction(page, specialCharTransaction);
    await expect(page.getByText('Transaction created successfully')).toBeVisible();

    // Test concurrent updates
    const concurrentUpdates = [];
    for (let i = 0; i < 10; i++) {
      concurrentUpdates.push(
        transactionPage.updateStatus(minId, TransactionStatus.IN_PROGRESS, { timeout: 0 })
      );
    }
    await Promise.all(concurrentUpdates);
    await expect(page.getByText('Concurrent update detected')).toBeVisible();

    // Test transaction rollback
    await transactionPage.updateStatus(minId, TransactionStatus.FAILED, { forceError: true });
    await expect(page.getByText('Transaction rolled back successfully')).toBeVisible();
  });

  test('should aggregate transaction data', async ({ page }) => {
    // Create test transactions for aggregation
    const transactions = [
      // RFQ Submissions
      ...Array(5).fill(0).map((_, i) => ({
        type: TransactionType.RFQ_SUBMISSION,
        status: TransactionStatus.COMPLETED,
        amount: 1000 * (i + 1),
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        description: `RFQ #${1000 + i}`,
        metadata: { category: 'Electronics', priority: 'High' }
      })),
      
      // PO Creations
      ...Array(3).fill(0).map((_, i) => ({
        type: TransactionType.PO_CREATION,
        status: TransactionStatus.IN_PROGRESS,
        amount: 2000 * (i + 1),
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        description: `PO #${2000 + i}`,
        metadata: { category: 'Furniture', priority: 'Medium' }
      })),
      
      // Payments
      ...Array(2).fill(0).map((_, i) => ({
        type: TransactionType.PAYMENT,
        status: TransactionStatus.PENDING,
        amount: 3000 * (i + 1),
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        description: `Payment #${3000 + i}`,
        metadata: { category: 'Services', priority: 'Low' }
      }))
    ];

    // Create transactions
    for (const tx of transactions) {
      await createTestTransaction(page, tx);
    }

    // Test aggregate by type
    const typeAggregates = await transactionPage.aggregateTransactions({
      groupBy: 'type',
      metrics: ['count', 'sum(amount)', 'avg(amount)']
    });

    expect(typeAggregates).toHaveLength(3);
    expect(typeAggregates).toContainEqual(expect.objectContaining({
      type: TransactionType.RFQ_SUBMISSION,
      count: 5,
      sum_amount: 15000,
      avg_amount: 3000
    }));

    // Test aggregate by status
    const statusAggregates = await transactionPage.aggregateTransactions({
      groupBy: 'status',
      metrics: ['count', 'sum(amount)'],
      filter: { dateRange: 'last_7_days' }
    });

    // Test time-based aggregation
    const timeAggregates = await transactionPage.aggregateTransactions({
      groupBy: 'date',
      timeFrame: 'day',
      metrics: ['count', 'sum(amount)']
    });

    // Test metadata aggregation
    const categoryAggregates = await transactionPage.aggregateTransactions({
      groupBy: 'metadata.category',
      metrics: ['count', 'sum(amount)']
    });

    // Test complex aggregation with multiple dimensions
    const complexAggregates = await transactionPage.aggregateTransactions({
      groupBy: ['type', 'metadata.priority'],
      metrics: ['count', 'sum(amount)', 'avg(amount)'],
      filter: { dateRange: 'last_30_days' },
      sort: { field: 'sum(amount)', order: 'desc' },
      limit: 10
    });
  });

  test('should validate state transitions', async ({ page }) => {
    // Define valid state transitions
    const validTransitions = [
      // RFQ Submission flow
      {
        type: TransactionType.RFQ_SUBMISSION,
        transitions: [
          { from: TransactionStatus.PENDING, to: TransactionStatus.IN_REVIEW },
          { from: TransactionStatus.IN_REVIEW, to: TransactionStatus.APPROVED },
          { from: TransactionStatus.APPROVED, to: TransactionStatus.COMPLETED },
          { from: TransactionStatus.IN_REVIEW, to: TransactionStatus.REJECTED }
        ]
      },
      
      // PO Creation flow
      {
        type: TransactionType.PO_CREATION,
        transitions: [
          { from: TransactionStatus.PENDING, to: TransactionStatus.APPROVAL_PENDING },
          { from: TransactionStatus.APPROVAL_PENDING, to: TransactionStatus.APPROVED },
          { from: TransactionStatus.APPROVED, to: TransactionStatus.IN_PROGRESS },
          { from: TransactionStatus.IN_PROGRESS, to: TransactionStatus.COMPLETED },
          { from: TransactionStatus.APPROVAL_PENDING, to: TransactionStatus.REJECTED }
        ]
      },
      
      // Payment flow
      {
        type: TransactionType.PAYMENT,
        transitions: [
          { from: TransactionStatus.PENDING, to: TransactionStatus.PROCESSING },
          { from: TransactionStatus.PROCESSING, to: TransactionStatus.COMPLETED },
          { from: TransactionStatus.PROCESSING, to: TransactionStatus.FAILED },
          { from: TransactionStatus.FAILED, to: TransactionStatus.RETRYING },
          { from: TransactionStatus.RETRYING, to: TransactionStatus.PROCESSING }
        ]
      }
    ];

    // Test each transaction type
    for (const { type, transitions } of validTransitions) {
      // Create transaction in initial state
      const txId = await createTestTransaction(page, {
        type,
        status: transitions[0].from,
        amount: 1000,
        date: new Date().toISOString(),
        description: `Test ${type} state transitions`
      });

      // Test each valid transition
      for (const transition of transitions) {
        await transactionPage.updateStatus(txId, transition.to);
        await expect(page.getByText(`Status updated to ${transition.to}`)).toBeVisible();
        
        // Verify state history
        await transactionPage.viewStateHistory(txId);
        const history = await page.getByRole('list', { name: /state history/i });
        await expect(history.getByText(`${transition.from} → ${transition.to}`)).toBeVisible();
      }

      // Test invalid transitions
      const invalidTransitions = [
        { from: TransactionStatus.PENDING, to: TransactionStatus.COMPLETED },
        { from: TransactionStatus.APPROVED, to: TransactionStatus.REJECTED },
        { from: TransactionStatus.COMPLETED, to: TransactionStatus.PENDING }
      ];

      for (const transition of invalidTransitions) {
        await transactionPage.updateStatus(txId, transition.to);
        await expect(page.getByText(`Invalid transition: ${transition.from} → ${transition.to}`)).toBeVisible();
      }
    }

    // Test concurrent state transitions
    const txId = await createTestTransaction(page, {
      type: TransactionType.RFQ_SUBMISSION,
      status: TransactionStatus.PENDING,
      amount: 1000,
      date: new Date().toISOString(),
      description: 'Test concurrent state transitions'
    });

    const concurrentUpdates = [
      transactionPage.updateStatus(txId, TransactionStatus.IN_REVIEW),
      transactionPage.updateStatus(txId, TransactionStatus.APPROVED)
    ];

    const results = await Promise.allSettled(concurrentUpdates);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    expect(successCount).toBe(1); // Only one should succeed
  });

  test('should handle related transactions and validate their rules', async ({ page }) => {
    // Create related transactions
    const rfqTransaction = {
      type: TransactionType.RFQ_SUBMISSION,
      status: TransactionStatus.COMPLETED,
      amount: 10000,
      date: new Date(Date.now()).toISOString(),
      description: 'RFQ #1234 submission',
      metadata: {
        rfqId: '1234',
        supplierId: '5678'
      }
    };

    const poTransaction = {
      type: TransactionType.PO_CREATION,
      status: TransactionStatus.PENDING,
      amount: 10000,
      date: new Date(Date.now()).toISOString(),
      description: 'PO #567 creation',
      metadata: {
        poId: '567',
        rfqId: '1234'
      }
    };

    const paymentTransaction = {
      type: TransactionType.PAYMENT,
      status: TransactionStatus.PENDING,
      amount: 10000,
      date: new Date(Date.now()).toISOString(),
      description: 'Payment for PO #567',
      metadata: {
        poId: '567',
        paymentId: 'PAY123'
      }
    };

    // Create transactions
    const rfqId = await createTestTransaction(page, rfqTransaction);
    const poId = await createTestTransaction(page, poTransaction);
    const paymentId = await createTestTransaction(page, paymentTransaction);

    // Test relationship validation rules
    const validationRules = [
      // Reference validation
      {
        description: 'Reference validation',
        data: {
          rfqId: '1234',
          poId: '567',
          paymentId: 'PAY123'
        },
        expectedErrors: [
          'rfqId does not match PO reference',
          'poId does not match payment reference'
        ]
      },

      // Status validation
      {
        description: 'Status validation',
        data: {
          rfqStatus: TransactionStatus.PENDING,
          poStatus: TransactionStatus.COMPLETED,
          paymentStatus: TransactionStatus.PENDING
        },
        expectedErrors: [
          'Invalid status order: PO cannot be completed before RFQ',
          'Payment cannot be pending while PO is completed'
        ]
      },

      // Amount validation
      {
        description: 'Amount validation',
        data: {
          rfqAmount: 10000,
          poAmount: 15000,
          paymentAmount: 5000
        },
        expectedErrors: [
          'PO amount exceeds RFQ amount',
          'Payment amount does not match PO amount'
        ]
      },

      // Date validation
      {
        description: 'Date validation',
        data: {
          rfqDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          poDate: new Date(Date.now()).toISOString(),
          paymentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        expectedErrors: [
          'PO date cannot be before RFQ date',
          'Payment date cannot be before PO date'
        ]
      }
    ];

    // Test each validation rule
    for (const { description, data, expectedErrors } of validationRules) {
      await transactionPage.validateRelationships(rfqId, data);
      for (const error of expectedErrors) {
        await expect(page.getByText(error)).toBeVisible();
      }
    }

    // Test valid relationships
    await transactionPage.validateRelationships(rfqId, {
      rfqId: '1234',
      poId: '567',
      paymentId: 'PAY123',
      rfqStatus: TransactionStatus.COMPLETED,
      poStatus: TransactionStatus.IN_PROGRESS,
      paymentStatus: TransactionStatus.PENDING,
      rfqAmount: 10000,
      poAmount: 10000,
      paymentAmount: 10000,
      rfqDate: new Date(Date.now()).toISOString(),
      poDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      paymentDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    });
    await expect(page.getByText('All relationships are valid')).toBeVisible();

    // Test relationship updates
    await transactionPage.updateRelationship(rfqId, poId, {
      status: TransactionStatus.APPROVED,
      amount: 10000,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    await expect(page.getByText('Relationship updated successfully')).toBeVisible();

    // Test relationship history
    await transactionPage.viewRelationshipHistory(rfqId);
    const history = await page.getByRole('list', { name: /relationship history/i });
    await expect(history.getByText('PO #567 created')).toBeVisible();
    await expect(history.getByText('Payment created for PO #567')).toBeVisible();
    await expect(history.getByText('Status updated to Approved')).toBeVisible();
  });

  test('should handle various metadata types and conversions', async ({ page }) => {
    // Create test transactions with different metadata types
    const metadataTypes = [
      // Basic metadata
      {
        type: 'basic',
        data: {
          rfqId: '1234',
          supplierId: '5678',
          quantity: 100,
          unit: 'units',
          category: 'electronics'
        }
      },

      // Nested metadata
      {
        type: 'nested',
        data: {
          rfq: {
            id: '1234',
            title: 'Test RFQ',
            category: 'electronics'
          },
          supplier: {
            id: '5678',
            name: 'Test Supplier',
            specialties: ['electronics', 'software']
          }
        }
      },

      // Array metadata
      {
        type: 'array',
        data: {
          attachments: [
            { id: '1', name: 'spec.pdf', type: 'pdf' },
            { id: '2', name: 'diagram.png', type: 'image' }
          ],
          items: [
            { id: '1', name: 'Component A', quantity: 50 },
            { id: '2', name: 'Component B', quantity: 25 }
          ]
        }
      },

      // Date metadata
      {
        type: 'date',
        data: {
          createdAt: new Date(Date.now()).toISOString(),
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          timestamps: {
            submitted: new Date(Date.now()).toISOString(),
            approved: null
          }
        }
      },

      // Complex metadata
      {
        type: 'complex',
        data: {
          references: {
            rfq: '1234',
            po: 'PO123',
            invoice: 'INV456'
          },
          metrics: {
            leadTime: 14,
            deliveryTime: 7,
            margin: 0.25
          },
          notes: [
            { date: new Date().toISOString(), text: 'Initial submission' },
            { date: new Date().toISOString(), text: 'Pending approval' }
          ]
        }
      }
    ];

    // Create and validate each metadata type
    for (const { type, data } of metadataTypes) {
      const transaction = {
        type: TransactionType.RFQ_SUBMISSION,
        status: TransactionStatus.PENDING,
        amount: 10000,
        date: new Date(Date.now()).toISOString(),
        description: `Test transaction with ${type} metadata`,
        metadata: data
      };

      const transactionId = await createTestTransaction(page, transaction);

      // Navigate to transaction history
      await page.goto('/transactions');
      await transactionPage.waitForLoad();

      // Verify metadata display
      const transactionRow = await page.getByRole('listitem').first();
      await expect(transactionRow.getByText(`Test transaction with ${type} metadata`)).toBeVisible();

      // Verify metadata details
      await transactionPage.viewMetadata(transactionId);
      const metadataDialog = await page.getByRole('dialog', { name: /metadata/i });
      await expect(metadataDialog).toBeVisible();

      // Validate specific fields for each type
      switch (type) {
        case 'basic':
          await expect(metadataDialog.getByText('RFQ ID: 1234')).toBeVisible();
          await expect(metadataDialog.getByText('Supplier ID: 5678')).toBeVisible();
          break;

        case 'nested':
          await expect(metadataDialog.getByText('Supplier Name: Test Supplier')).toBeVisible();
          await expect(metadataDialog.getByText('Specialties: electronics, software')).toBeVisible();
          break;

        case 'array':
          await expect(metadataDialog.getByText('Attachments: 2 items')).toBeVisible();
          await expect(metadataDialog.getByText('Items: 2 items')).toBeVisible();
          break;

        case 'date':
          await expect(metadataDialog.getByText('Created At')).toBeVisible();
          await expect(metadataDialog.getByText('Deadline')).toBeVisible();
          break;

        case 'complex':
          await expect(metadataDialog.getByText('References')).toBeVisible();
          await expect(metadataDialog.getByText('Metrics')).toBeVisible();
          await expect(metadataDialog.getByText('Notes')).toBeVisible();
          break;
      }

      // Test metadata update
      await transactionPage.updateMetadata(transactionId, {
        ...data,
        updated: new Date().toISOString()
      });

      await expect(page.getByText('Metadata updated successfully')).toBeVisible();
    }

    // Test metadata type conversion
    const transactionId = await createTestTransaction(page, {
      type: TransactionType.RFQ_SUBMISSION,
      status: TransactionStatus.PENDING,
      amount: 10000,
      date: new Date(Date.now()).toISOString(),
      description: 'Test metadata conversion',
      metadata: {
        quantity: '100', // string to number
        date: '2025-05-23', // string to date
        active: 'true', // string to boolean
        tags: ['test', 'sample'] // array of strings
      }
    });

    // Verify type conversion
    await page.goto('/transactions');
    await transactionPage.waitForLoad();

    const transactionRow = await page.getByRole('listitem').first();
    await expect(transactionRow.getByText('Quantity: 100')).toBeVisible(); // number
    await expect(transactionRow.getByText('Date: 2025-05-23')).toBeVisible(); // date
    await expect(transactionRow.getByText('Active: true')).toBeVisible(); // boolean
    await expect(transactionRow.getByText('Tags: test, sample')).toBeVisible(); // array
  });

  test('should validate invalid metadata and its history', async ({ page }) => {
    // Create test transaction with invalid metadata
    const invalidTransaction = {
      type: TransactionType.RFQ_SUBMISSION,
      status: TransactionStatus.PENDING,
      amount: 10000,
      date: new Date(Date.now()).toISOString(),
      description: 'RFQ #1234 submission',
      metadata: {
        rfqId: '', // Invalid empty ID
        supplierId: 'invalid', // Invalid format
        quantity: -100, // Invalid negative value
        unit: 'invalid_unit', // Invalid unit
        category: 'electronics'
      }
    };

    // Try to create transaction with invalid metadata
    await createTestTransaction(page, invalidTransaction);
    await expect(page.getByText('Invalid metadata: rfqId cannot be empty')).toBeVisible();
    await expect(page.getByText('Invalid metadata: supplierId format is invalid')).toBeVisible();
    await expect(page.getByText('Invalid metadata: quantity must be positive')).toBeVisible();
    await expect(page.getByText('Invalid metadata: invalid unit specified')).toBeVisible();

    // Create transaction with valid metadata
    const validTransaction = {
      type: TransactionType.RFQ_SUBMISSION,
      status: TransactionStatus.PENDING,
      amount: 10000,
      date: new Date(Date.now()).toISOString(),
      description: 'RFQ #1234 submission',
      metadata: {
        rfqId: '1234',
        supplierId: '5678',
        quantity: 100,
        unit: 'units',
        category: 'electronics'
      }
    };

    const transactionId = await createTestTransaction(page, validTransaction);

    // Verify metadata validation in UI
    await page.goto('/transactions');
    await transactionPage.waitForLoad();

    const transactionRow = await page.getByRole('listitem').first();
    await expect(transactionRow.getByText('RFQ ID: 1234')).toBeVisible();
    await expect(transactionRow.getByText('Supplier ID: 5678')).toBeVisible();
    await expect(transactionRow.getByText('Quantity: 100 units')).toBeVisible();

    // Test metadata update validation
    await transactionPage.updateMetadata(transactionId, {
      quantity: -50, // Invalid negative value
      unit: 'invalid_unit' // Invalid unit
    });

    await expect(page.getByText('Invalid update: quantity must be positive')).toBeVisible();
    await expect(page.getByText('Invalid update: invalid unit specified')).toBeVisible();

    // Test metadata update with valid values
    await transactionPage.updateMetadata(transactionId, {
      quantity: 200,
      unit: 'pieces'
    });

    await expect(page.getByText('Metadata updated successfully')).toBeVisible();
    await expect(transactionRow.getByText('Quantity: 200 pieces')).toBeVisible();

    // Test metadata history
    await transactionPage.viewMetadataHistory(transactionId);
    const metadataHistory = await page.getByRole('list', { name: /metadata history/i });
    await expect(metadataHistory.getByText('Quantity: 100 → 200')).toBeVisible();
    await expect(metadataHistory.getByText('Unit: units → pieces')).toBeVisible();
  });

  test('should handle status updates and history', async ({ page }) => {
    // Create test transaction
    const transaction = {
      type: TransactionType.RFQ_SUBMISSION,
      status: TransactionStatus.PENDING,
      amount: 10000,
      date: new Date(Date.now()).toISOString(),
      description: 'RFQ #1234 submission'
    };

    const transactionId = await createTestTransaction(page, transaction);

    // Navigate to transaction history
    await page.goto('/transactions');
    await transactionPage.waitForLoad();

    // Update status to approved
    await transactionPage.updateStatus(transactionId, TransactionStatus.APPROVED);
    await expect(page.getByText('Transaction status updated to Approved')).toBeVisible();

    // Verify status change
    const transactionRow = await page.getByRole('listitem').first();
    await expect(transactionRow.getByText('Approved')).toBeVisible();

    // Update status to completed
    await transactionPage.updateStatus(transactionId, TransactionStatus.COMPLETED);
    await expect(page.getByText('Transaction status updated to Completed')).toBeVisible();

    // Verify status history
    await transactionPage.viewStatusHistory(transactionId);
    const statusHistory = await page.getByRole('list', { name: /status history/i });
    await expect(statusHistory.getByText('Pending → Approved')).toBeVisible();
    await expect(statusHistory.getByText('Approved → Completed')).toBeVisible();

    // Verify timestamps
    const timestamps = await statusHistory.getByRole('cell', { name: /timestamp/i });
    await expect(timestamps).toHaveCount(2);
  });

  test('should handle specific UI error scenarios for exports and navigation', async ({ page }) => {
    // Create test transaction
    const transaction = {
      type: TransactionType.RFQ_SUBMISSION,
      status: TransactionStatus.COMPLETED,
      amount: 10000,
      date: new Date(Date.now()).toISOString(),
      description: 'RFQ #1234 submission'
    };

    await createTestTransaction(page, transaction);

    // Navigate to transaction history
    await page.goto('/transactions');
    await transactionPage.waitForLoad();

    // Test invalid export format
    await transactionPage.clickExport('invalid_format');
    await expect(page.getByText('Invalid export format: invalid_format')).toBeVisible();

    // Test export with no transactions
    await page.getByRole('button', { name: /clear filters/i }).click();
    await transactionPage.clickExport('pdf');
    await expect(page.getByText('No transactions to export')).toBeVisible();

    // Test invalid status update
    await transactionPage.updateStatus('invalid-id', TransactionStatus.COMPLETED);
    await expect(page.getByText('Transaction not found: invalid-id')).toBeVisible();

    // Test invalid status transition
    const transactionId = await createTestTransaction(page, {
      ...transaction,
      status: TransactionStatus.CANCELLED
    });

    await transactionPage.updateStatus(transactionId, TransactionStatus.PENDING);
    await expect(page.getByText('Invalid status transition: Cannot move from Cancelled to Pending')).toBeVisible();

    // Test invalid date range
    await transactionPage.selectDateRange('invalid_range');
    await expect(page.getByText('Invalid date range: invalid_range')).toBeVisible();

    // Test invalid filter combination
    await transactionPage.selectFilter('type', TransactionType.RFQ_SUBMISSION);
    await transactionPage.selectFilter('status', TransactionStatus.CANCELLED);
    await expect(page.getByText('No transactions found matching filters')).toBeVisible();

    // Test pagination errors
    await transactionPage.gotoPage(0);
    await expect(page.getByText('Invalid page number: must be greater than 0')).toBeVisible();

    await transactionPage.gotoPage(100);
    await expect(page.getByText('Page out of range: 100')).toBeVisible();
  });

  test('should handle transaction export to different formats', async ({ page }) => {
    // Create test transactions
    const transactions = [
      {
        type: TransactionType.RFQ_SUBMISSION,
        status: TransactionStatus.COMPLETED,
        amount: 10000,
        date: new Date(Date.now()).toISOString(),
        description: 'RFQ #1234 submission'
      },
      {
        type: TransactionType.SUPPLIER_MATCH,
        status: TransactionStatus.PENDING,
        amount: 5000,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'Supplier matching for RFQ #1234'
      }
    ];

    for (const transaction of transactions) {
      await createTestTransaction(page, transaction);
    }

    // Navigate to transaction history
    await page.goto('/transactions');
    await transactionPage.waitForLoad();

    // Export to PDF
    await transactionPage.clickExport('pdf');
    await expect(page.getByText('PDF export successful')).toBeVisible();

    // Export to Excel
    await transactionPage.clickExport('excel');
    await expect(page.getByText('Excel export successful')).toBeVisible();

    // Export to CSV
    await transactionPage.clickExport('csv');
    await expect(page.getByText('CSV export successful')).toBeVisible();
  });

  test('should handle transaction search', async ({ page }) => {
    // Create test transactions
    const transactions = [
      {
        type: TransactionType.RFQ_SUBMISSION,
        status: TransactionStatus.COMPLETED,
        amount: 10000,
        date: new Date(Date.now()).toISOString(),
        description: 'RFQ #1234 submission'
      },
      {
        type: TransactionType.SUPPLIER_MATCH,
        status: TransactionStatus.PENDING,
        amount: 5000,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'Supplier matching for RFQ #1234'
      }
    ];

    for (const transaction of transactions) {
      await createTestTransaction(page, transaction);
    }

    // Navigate to transaction history
    await page.goto('/transactions');
    await transactionPage.waitForLoad();

    // Search by description
    await transactionPage.search('RFQ');
    await expect(page.getByText('RFQ #1234 submission')).toBeVisible();
    await expect(page.getByText('Supplier matching for RFQ #1234')).toBeVisible();

    // Search by amount
    await transactionPage.search('10000');
    await expect(page.getByText('RFQ #1234 submission')).toBeVisible();
    await expect(page.getByText('Supplier matching for RFQ #1234')).not.toBeVisible();

    // Search with no results
    await transactionPage.search('nonexistent');
    await expect(page.getByText('No transactions found')).toBeVisible();
  });

  test('should handle transaction pagination', async ({ page }) => {
    // Create large number of transactions
    const transactions = Array.from({ length: 50 }, (_, i) => ({
      type: TransactionType.RFQ_SUBMISSION,
      status: TransactionStatus.COMPLETED,
      amount: 1000 + i * 100,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      description: `RFQ #${i + 1} submission`
    }));

    for (const transaction of transactions) {
      await createTestTransaction(page, transaction);
    }

    // Navigate to transaction history
    await page.goto('/transactions');
    await transactionPage.waitForLoad();

    // Verify pagination
    const pagination = await page.getByRole('navigation', { name: /pagination/i });
    await expect(pagination).toBeVisible();

    // Navigate pages
    await page.getByRole('button', { name: /next page/i }).click();
    await expect(page.getByText('RFQ #21 submission')).toBeVisible();

    await page.getByRole('button', { name: /previous page/i }).click();
    await expect(page.getByText('RFQ #1 submission')).toBeVisible();

    // Verify page count
    const pageCount = await page.getByRole('button', { name: /page 1/i });
    await expect(pageCount).toBeVisible();
  });

  test('should handle transaction details', async ({ page }) => {
    // Create test transaction
    const transaction = {
      type: TransactionType.RFQ_SUBMISSION,
      status: TransactionStatus.COMPLETED,
      amount: 10000,
      date: new Date(Date.now()).toISOString(),
      description: 'RFQ #1234 submission',
      metadata: {
        rfqId: '1234',
        supplierId: '5678',
        quantity: 100,
        unit: 'units',
        category: 'electronics'
      }
    };

    await createTestTransaction(page, transaction);

    // Navigate to transaction history
    await page.goto('/transactions');
    await transactionPage.waitForLoad();

    // View transaction details
    await page.getByRole('button', { name: /view details/i }).click();

    // Verify details
    await expect(page.getByText('RFQ ID: 1234')).toBeVisible();
    await expect(page.getByText('Supplier ID: 5678')).toBeVisible();
    await expect(page.getByText('Quantity: 100 units')).toBeVisible();
    await expect(page.getByText('Category: electronics')).toBeVisible();
  });

  test('should handle transaction errors', async ({ page }) => {
    // Create test transaction
    const transaction = {
      type: TransactionType.RFQ_SUBMISSION,
      status: TransactionStatus.COMPLETED,
      amount: 10000,
      date: new Date(Date.now()).toISOString(),
      description: 'RFQ #1234 submission'
    };

    await createTestTransaction(page, transaction);

    // Navigate to transaction history
    await page.goto('/transactions');
    await transactionPage.waitForLoad();

    // Try exporting with no transactions selected
    await transactionPage.clickExport('pdf');
    await expect(page.getByText('No transactions selected')).toBeVisible();

    // Try viewing details for non-existent transaction
    await page.getByRole('button', { name: /view details/i }).click();
    await expect(page.getByText('Transaction not found')).toBeVisible();
  });

  test.afterEach(async () => {
    // Cleanup test data
    await api.cleanupTestData();
  });
});
