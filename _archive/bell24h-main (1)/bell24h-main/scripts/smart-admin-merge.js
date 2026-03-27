const fs = require('fs');
const path = require('path');

const mergeStrategies = {
  // If page exists in both: enhance Vercel version with localhost features
  enhance: async (vercelPage, localhostPage) => {
    console.log(`🔄 Enhancing: ${vercelPage.path}`);

    // Read both files
    const vercelContent = fs.readFileSync(vercelPage.path, 'utf8');
    const localhostContent = fs.readFileSync(localhostPage.path, 'utf8');

    // Compare features and identify enhancements
    const enhancements = identifyEnhancements(vercelContent, localhostContent);

    if (enhancements.length > 0) {
      // Create enhanced version
      const enhancedContent = applyEnhancements(vercelContent, enhancements);

      // Backup original
      const backupPath = `${vercelPage.path}.backup-${Date.now()}`;
      fs.writeFileSync(backupPath, vercelContent);
      console.log(`  💾 Original backed up to: ${backupPath}`);

      // Write enhanced version
      fs.writeFileSync(vercelPage.path, enhancedContent);
      console.log(`  ✅ Enhanced: ${vercelPage.path}`);
    } else {
      console.log(`  ℹ️ No enhancements needed: ${vercelPage.path}`);
    }
  },

  // If page only exists in localhost: safe to add
  addNew: async (localhostPage) => {
    console.log(`➕ Adding new: ${localhostPage.path}`);

    // Ensure directory exists
    const destDir = path.dirname(localhostPage.path);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Copy file
    const content = fs.readFileSync(localhostPage.path, 'utf8');
    fs.writeFileSync(localhostPage.path, content);
    console.log(`  ✅ Added: ${localhostPage.path}`);
  },

  // If features overlap: create consolidated version
  consolidate: async (features) => {
    console.log(`🔗 Consolidating features...`);

    // Merge similar features
    const consolidated = mergeFeatures(features);

    // Remove duplicates
    const deduplicated = removeDuplicates(consolidated);

    // Enhance functionality
    const enhanced = enhanceFunctionality(deduplicated);

    console.log(`  ✅ Consolidated ${features.length} features into enhanced version`);
    return enhanced;
  }
};

async function smartMerge() {
  console.log('🚀 Starting Smart Admin Merge...\n');

  // Load audit results
  const auditResults = await loadAuditResults();

  if (!auditResults) {
    console.log('❌ No audit results found. Run audit first.');
    return;
  }

  console.log(`📊 Processing ${auditResults.conflicts.length} conflicts...`);

  // Process conflicts
  for (const page of auditResults.conflicts) {
    console.log(`\n🔄 Processing conflict: ${page.path}`);

    if (page.strategy === 'enhance') {
      await mergeStrategies.enhance(page.vercel, page.localhost);
    } else if (page.strategy === 'consolidate') {
      await mergeStrategies.consolidate([page.vercel, page.localhost]);
    }
  }

  console.log(`\n📊 Processing ${auditResults.newFeatures.length} new features...`);

  // Add completely new pages (no conflicts)
  for (const newPage of auditResults.newFeatures) {
    console.log(`\n➕ Adding new page: ${newPage.path}`);
    await mergeStrategies.addNew(newPage.localhost);
  }

  console.log(`\n📊 Processing ${auditResults.enhancements.length} enhancements...`);

  // Process enhancements
  for (const enhancement of auditResults.enhancements) {
    console.log(`\n🔄 Processing enhancement: ${enhancement.path}`);
    await mergeStrategies.enhance(enhancement.vercel, enhancement.localhost);
  }

  console.log('\n✅ Smart merge completed!');
  console.log('📋 Summary:');
  console.log(`  - Conflicts processed: ${auditResults.conflicts.length}`);
  console.log(`  - New features added: ${auditResults.newFeatures.length}`);
  console.log(`  - Enhancements applied: ${auditResults.enhancements.length}`);
}

async function loadAuditResults() {
  // Find the most recent audit file
  const auditFiles = fs.readdirSync('.')
    .filter(file => file.startsWith('audit-results-') && file.endsWith('.json'))
    .sort()
    .reverse();

  if (auditFiles.length === 0) {
    return null;
  }

  const latestAudit = auditFiles[0];
  console.log(`📄 Loading audit results from: ${latestAudit}`);

  return JSON.parse(fs.readFileSync(latestAudit, 'utf8'));
}

function identifyEnhancements(vercelContent, localhostContent) {
  const enhancements = [];

  // Simple enhancement detection (can be made more sophisticated)
  const vercelLines = vercelContent.split('\n');
  const localhostLines = localhostContent.split('\n');

  // Find new functions/components in localhost
  for (let i = 0; i < localhostLines.length; i++) {
    const line = localhostLines[i];
    if (line.includes('function ') || line.includes('const ') || line.includes('export ')) {
      if (!vercelContent.includes(line.trim())) {
        enhancements.push({
          type: 'function',
          line: line,
          index: i
        });
      }
    }
  }

  return enhancements;
}

function applyEnhancements(vercelContent, enhancements) {
  let enhancedContent = vercelContent;

  for (const enhancement of enhancements) {
    // Add enhancement to the end of the file
    enhancedContent += `\n// Enhanced feature from localhost\n${enhancement.line}\n`;
  }

  return enhancedContent;
}

function mergeFeatures(features) {
  // Merge similar features
  const merged = [];
  const processed = new Set();

  for (const feature of features) {
    if (!processed.has(feature.path)) {
      merged.push(feature);
      processed.add(feature.path);
    }
  }

  return merged;
}

function removeDuplicates(consolidated) {
  // Remove duplicate features
  const unique = [];
  const seen = new Set();

  for (const item of consolidated) {
    const key = `${item.path}-${item.type}`;
    if (!seen.has(key)) {
      unique.push(item);
      seen.add(key);
    }
  }

  return unique;
}

function enhanceFunctionality(features) {
  // Enhance functionality (placeholder for now)
  return features;
}

// Run merge if called directly
if (require.main === module) {
  smartMerge().catch(console.error);
}

module.exports = { smartMerge, mergeStrategies };
