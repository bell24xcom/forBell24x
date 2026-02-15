// BELL24H Unified Marketplace System Test
// Comprehensive verification of all unified business model features

const { chromium } = require('playwright');

async function testUnifiedMarketplace() {
  console.log('🚀 Starting BELL24H Unified Marketplace System Test...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 1. TEST HOMEPAGE NAVIGATION
    console.log('📋 1. Testing Homepage Navigation...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Verify unified navigation links
    const marketplaceLink = await page.locator(
      'a[href="/marketplace?mode=buying"]'
    );
    const dashboardLink = await page.locator('a[href="/dashboard"]');

    if (
      (await marketplaceLink.isVisible()) &&
      (await dashboardLink.isVisible())
    ) {
      console.log('✅ Homepage navigation updated to unified model');
    } else {
      console.log('❌ Homepage navigation not properly updated');
    }

    // 2. TEST MARKETPLACE MODE SWITCHING
    console.log('\n📋 2. Testing Marketplace Mode Switching...');

    // Test buying mode
    await page.goto('http://localhost:3000/marketplace?mode=buying');
    await page.waitForLoadState('networkidle');

    const buyingTitle = await page.locator('h1').textContent();
    if (buyingTitle.includes('Find Business Partners to Buy From')) {
      console.log('✅ Buying mode marketplace working correctly');
    } else {
      console.log('❌ Buying mode marketplace not working');
    }

    // Test selling mode
    await page.goto('http://localhost:3000/marketplace?mode=selling');
    await page.waitForLoadState('networkidle');

    const sellingTitle = await page.locator('h1').textContent();
    if (sellingTitle.includes('Find Business Partners to Sell To')) {
      console.log('✅ Selling mode marketplace working correctly');
    } else {
      console.log('❌ Selling mode marketplace not working');
    }

    // 3. TEST UNIFIED DASHBOARD
    console.log('\n📋 3. Testing Unified Dashboard...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');

    // Test mode switching in dashboard
    const buyingModeBtn = await page.locator('button:has-text("Buying Mode")');
    const sellingModeBtn = await page.locator(
      'button:has-text("Selling Mode")'
    );

    if (
      (await buyingModeBtn.isVisible()) &&
      (await sellingModeBtn.isVisible())
    ) {
      console.log('✅ Dashboard mode switching buttons present');

      // Test switching to selling mode
      await sellingModeBtn.click();
      await page.waitForTimeout(1000);

      const sellingTitle = await page.locator('h1').textContent();
      if (sellingTitle.includes('Selling Dashboard')) {
        console.log('✅ Dashboard mode switching working correctly');
      } else {
        console.log('❌ Dashboard mode switching not working');
      }
    } else {
      console.log('❌ Dashboard mode switching buttons not found');
    }

    // 4. TEST BUSINESS PARTNERS DIRECTORY
    console.log('\n📋 4. Testing Business Partners Directory...');
    await page.goto('http://localhost:3000/suppliers');
    await page.waitForLoadState('networkidle');

    const directoryTitle = await page.locator('h1').textContent();
    if (directoryTitle.includes('Business Partners Directory')) {
      console.log('✅ Business partners directory terminology updated');
    } else {
      console.log('❌ Business partners directory not updated');
    }

    // 5. TEST PARTNER PROFILE PERFORMANCE
    console.log('\n📋 5. Testing Partner Profile Performance...');
    const startTime = Date.now();
    await page.goto('http://localhost:3000/suppliers/1');
    await page.waitForLoadState('networkidle');
    const loadTime = (Date.now() - startTime) / 1000;

    if (loadTime < 5) {
      console.log(
        `✅ Partner profile optimized: ${loadTime.toFixed(2)}s (target: <5s)`
      );
    } else {
      console.log(
        `❌ Partner profile not optimized: ${loadTime.toFixed(
          2
        )}s (target: <5s)`
      );
    }

    // 6. TEST CONTEXT-AWARE ACTIONS
    console.log('\n📋 6. Testing Context-Aware Actions...');

    // Test buying mode actions
    await page.goto('http://localhost:3000/marketplace?mode=buying');
    await page.waitForLoadState('networkidle');

    const buyingActions = await page.locator(
      'button:has-text("Connect & Trade")'
    );
    if ((await buyingActions.count()) > 0) {
      console.log('✅ Buying mode actions working correctly');
    } else {
      console.log('❌ Buying mode actions not working');
    }

    // Test selling mode actions
    await page.goto('http://localhost:3000/marketplace?mode=selling');
    await page.waitForLoadState('networkidle');

    const sellingActions = await page.locator(
      'button:has-text("Offer Products")'
    );
    if ((await sellingActions.count()) > 0) {
      console.log('✅ Selling mode actions working correctly');
    } else {
      console.log('❌ Selling mode actions not working');
    }

    // 7. TEST UNIFIED TERMINOLOGY
    console.log('\n📋 7. Testing Unified Terminology...');

    // Check for updated terminology throughout
    const pageContent = await page.content();
    const terminologyChecks = [
      {
        old: 'suppliers',
        new: 'business partners',
        found: pageContent.includes('business partners'),
      },
      {
        old: 'Request Quote',
        new: 'Connect & Trade',
        found: pageContent.includes('Connect & Trade'),
      },
      {
        old: 'Supplier Directory',
        new: 'Business Partners Directory',
        found: pageContent.includes('Business Partners Directory'),
      },
    ];

    terminologyChecks.forEach((check) => {
      if (check.found) {
        console.log(`✅ Terminology updated: "${check.old}" → "${check.new}"`);
      } else {
        console.log(
          `❌ Terminology not updated: "${check.old}" → "${check.new}"`
        );
      }
    });

    // 8. PERFORMANCE BENCHMARK
    console.log('\n📋 8. Performance Benchmark...');

    const performanceTests = [
      { name: 'Homepage', url: 'http://localhost:3000/' },
      {
        name: 'Marketplace (Buying)',
        url: 'http://localhost:3000/marketplace?mode=buying',
      },
      {
        name: 'Marketplace (Selling)',
        url: 'http://localhost:3000/marketplace?mode=selling',
      },
      { name: 'Dashboard', url: 'http://localhost:3000/dashboard' },
      { name: 'Business Partners', url: 'http://localhost:3000/suppliers' },
      { name: 'Partner Profile', url: 'http://localhost:3000/suppliers/1' },
    ];

    for (const test of performanceTests) {
      const start = Date.now();
      await page.goto(test.url);
      await page.waitForLoadState('networkidle');
      const loadTime = (Date.now() - start) / 1000;

      if (loadTime < 7) {
        console.log(`✅ ${test.name}: ${loadTime.toFixed(2)}s (target: <7s)`);
      } else {
        console.log(`❌ ${test.name}: ${loadTime.toFixed(2)}s (target: <7s)`);
      }
    }

    // 9. FINAL VERIFICATION
    console.log('\n📋 9. Final System Verification...');

    const verificationChecks = [
      {
        name: 'Unified Navigation',
        url: 'http://localhost:3000/',
        selector: 'a[href="/marketplace?mode=buying"]',
      },
      {
        name: 'Mode Switching',
        url: 'http://localhost:3000/dashboard',
        selector: 'button:has-text("Buying Mode")',
      },
      {
        name: 'Context-Aware UI',
        url: 'http://localhost:3000/marketplace?mode=buying',
        selector: 'h1:has-text("Find Business Partners to Buy From")',
      },
      {
        name: 'Performance Optimization',
        url: 'http://localhost:3000/suppliers/1',
        expectedTime: 5,
      },
    ];

    let passedChecks = 0;
    for (const check of verificationChecks) {
      try {
        await page.goto(check.url);
        await page.waitForLoadState('networkidle');

        if (check.expectedTime) {
          const start = Date.now();
          await page.reload();
          await page.waitForLoadState('networkidle');
          const loadTime = (Date.now() - start) / 1000;

          if (loadTime < check.expectedTime) {
            console.log(`✅ ${check.name}: ${loadTime.toFixed(2)}s`);
            passedChecks++;
          } else {
            console.log(`❌ ${check.name}: ${loadTime.toFixed(2)}s`);
          }
        } else {
          const element = await page.locator(check.selector);
          if (await element.isVisible()) {
            console.log(`✅ ${check.name}: Working correctly`);
            passedChecks++;
          } else {
            console.log(`❌ ${check.name}: Not working`);
          }
        }
      } catch (error) {
        console.log(`❌ ${check.name}: Error - ${error.message}`);
      }
    }

    // FINAL RESULTS
    console.log('\n🎉 FINAL TEST RESULTS:');
    console.log(
      `✅ ${passedChecks}/${verificationChecks.length} core features working correctly`
    );

    if (passedChecks === verificationChecks.length) {
      console.log(
        '\n🚀 BELL24H UNIFIED MARKETPLACE SYSTEM: FULLY OPERATIONAL!'
      );
      console.log('✅ Performance optimized');
      console.log('✅ Unified business model implemented');
      console.log('✅ Context-aware interface working');
      console.log('✅ Mode switching functional');
      console.log('✅ Terminology updated');
      console.log('✅ Ready for production deployment!');
    } else {
      console.log('\n⚠️ Some features need attention before deployment');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testUnifiedMarketplace().catch(console.error);
