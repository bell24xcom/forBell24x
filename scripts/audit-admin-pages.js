const fs = require('fs');
const path = require('path');

async function auditAdminPages() {
  const audit = {
    vercel: {
      adminPages: [],
      adminComponents: [],
      adminAPIs: [],
      adminFeatures: []
    },
    localhost: {
      adminPages: [],
      adminComponents: [],
      adminAPIs: [],
      adminFeatures: []
    },
    conflicts: [],
    enhancements: [],
    newFeatures: []
  };

  console.log('🔍 ADMIN PAGES AUDIT STARTING...\n');

  // Step 1: Scan Vercel admin structure
  console.log('📊 Scanning Vercel Admin Pages...');
  await scanVercelAdmin(audit);

  // Step 2: Scan localhost admin structure  
  console.log('📊 Scanning Localhost Admin Pages...');
  await scanLocalhostAdmin(audit);

  // Step 3: Compare and identify conflicts/enhancements
  console.log('⚖️ Comparing Admin Structures...');
  await compareAdminStructures(audit);

  // Step 4: Generate migration plan
  console.log('📋 Generating Safe Migration Plan...');
  await generateMigrationPlan(audit);

  return audit;
}

async function scanVercelAdmin(audit) {
  console.log('  🔍 Checking Vercel admin structure...');

  // Check if admin routes exist in current deployment
  const adminRoutes = [
    'app/admin',
    'app/admin/dashboard',
    'app/admin/marketing',
    'app/admin/campaigns',
    'app/admin/analytics',
    'app/admin/users',
    'app/admin/settings'
  ];

  for (const route of adminRoutes) {
    if (fs.existsSync(route)) {
      audit.vercel.adminPages.push({
        path: route,
        exists: true,
        type: 'page'
      });
      console.log(`    ✅ Found: ${route}`);
    } else {
      console.log(`    ❌ Missing: ${route}`);
    }
  }

  // Check admin components
  const adminComponents = [
    'components/admin',
    'components/admin/AdminDashboard.tsx',
    'components/admin/MarketingDashboard.tsx',
    'components/admin/CampaignManagement.tsx'
  ];

  for (const component of adminComponents) {
    if (fs.existsSync(component)) {
      audit.vercel.adminComponents.push({
        path: component,
        exists: true,
        type: 'component'
      });
      console.log(`    ✅ Found: ${component}`);
    } else {
      console.log(`    ❌ Missing: ${component}`);
    }
  }

  // Check admin APIs
  const adminAPIs = [
    'app/api/admin',
    'app/api/campaigns',
    'app/api/auth/agent/login'
  ];

  for (const api of adminAPIs) {
    if (fs.existsSync(api)) {
      audit.vercel.adminAPIs.push({
        path: api,
        exists: true,
        type: 'api'
      });
      console.log(`    ✅ Found: ${api}`);
    } else {
      console.log(`    ❌ Missing: ${api}`);
    }
  }
}

async function scanLocalhostAdmin(audit) {
  console.log('  🔍 Checking localhost admin structure...');

  // Scan app/admin/ directory
  const adminDir = 'app/admin';
  if (fs.existsSync(adminDir)) {
    const files = fs.readdirSync(adminDir, { recursive: true });
    files.forEach(file => {
      if (typeof file === 'string' && file.endsWith('.tsx')) {
        audit.localhost.adminPages.push({
          path: path.join(adminDir, file),
          exists: true,
          type: 'page'
        });
        console.log(`    ✅ Found: ${path.join(adminDir, file)}`);
      }
    });
  }

  // Scan components/admin/ directory
  const componentsDir = 'components/admin';
  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir, { recursive: true });
    files.forEach(file => {
      if (typeof file === 'string' && file.endsWith('.tsx')) {
        audit.localhost.adminComponents.push({
          path: path.join(componentsDir, file),
          exists: true,
          type: 'component'
        });
        console.log(`    ✅ Found: ${path.join(componentsDir, file)}`);
      }
    });
  }

  // Scan api/admin/ routes
  const apiDir = 'app/api';
  if (fs.existsSync(apiDir)) {
    const files = fs.readdirSync(apiDir, { recursive: true });
    files.forEach(file => {
      if (typeof file === 'string' && file.includes('admin') || file.includes('campaigns') || file.includes('auth')) {
        audit.localhost.adminAPIs.push({
          path: path.join(apiDir, file),
          exists: true,
          type: 'api'
        });
        console.log(`    ✅ Found: ${path.join(apiDir, file)}`);
      }
    });
  }
}

async function compareAdminStructures(audit) {
  console.log('  🔍 Comparing structures...');

  // Find conflicts (pages that exist in both)
  for (const vercelPage of audit.vercel.adminPages) {
    const localhostPage = audit.localhost.adminPages.find(
      p => p.path === vercelPage.path
    );

    if (localhostPage) {
      audit.conflicts.push({
        path: vercelPage.path,
        vercel: vercelPage,
        localhost: localhostPage,
        strategy: 'enhance' // Default to enhance existing
      });
      console.log(`    ⚠️ Conflict: ${vercelPage.path}`);
    }
  }

  // Find new features (only in localhost)
  for (const localhostPage of audit.localhost.adminPages) {
    const vercelPage = audit.vercel.adminPages.find(
      p => p.path === localhostPage.path
    );

    if (!vercelPage) {
      audit.newFeatures.push({
        path: localhostPage.path,
        localhost: localhostPage,
        strategy: 'addNew'
      });
      console.log(`    ➕ New: ${localhostPage.path}`);
    }
  }

  // Find enhancements (localhost has improvements)
  for (const localhostComponent of audit.localhost.adminComponents) {
    const vercelComponent = audit.vercel.adminComponents.find(
      c => c.path === localhostComponent.path
    );

    if (vercelComponent) {
      audit.enhancements.push({
        path: localhostComponent.path,
        vercel: vercelComponent,
        localhost: localhostComponent,
        strategy: 'enhance'
      });
      console.log(`    🔄 Enhancement: ${localhostComponent.path}`);
    }
  }
}

async function generateMigrationPlan(audit) {
  console.log('  📋 Generating migration plan...');

  const plan = {
    safeToProceed: audit.conflicts.length === 0,
    totalChanges: audit.newFeatures.length + audit.enhancements.length,
    conflicts: audit.conflicts.length,
    newFeatures: audit.newFeatures.length,
    enhancements: audit.enhancements.length
  };

  console.log('\n📊 AUDIT RESULTS SUMMARY');
  console.log('========================');
  console.log(`✅ Safe to proceed: ${plan.safeToProceed ? 'YES' : 'NO'}`);
  console.log(`📈 Total changes: ${plan.totalChanges}`);
  console.log(`⚠️ Conflicts: ${plan.conflicts}`);
  console.log(`➕ New features: ${plan.newFeatures}`);
  console.log(`🔄 Enhancements: ${plan.enhancements}`);

  // Save audit results
  const timestamp = new Date().toISOString().split('T')[0];
  const auditFile = `audit-results-${timestamp}.json`;
  fs.writeFileSync(auditFile, JSON.stringify(audit, null, 2));
  console.log(`\n💾 Audit results saved to: ${auditFile}`);

  return plan;
}

// Run the audit
if (require.main === module) {
  auditAdminPages().catch(console.error);
}

module.exports = { auditAdminPages };
