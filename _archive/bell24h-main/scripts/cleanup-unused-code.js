const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

// Configuration
const config = {
  sourceDir: path.join(__dirname, '../src'),
  testDir: path.join(__dirname, '../test'),
  excludePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/__tests__/**',
    '**/__mocks__/**',
  ],
  fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
};

// Store all imports and exports
const imports = new Map();
const exports = new Map();
const usedIdentifiers = new Set();

// Parse file and collect imports/exports
function parseFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ast = parse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      if (!imports.has(source)) {
        imports.set(source, new Set());
      }
      path.node.specifiers.forEach((specifier) => {
        if (t.isImportSpecifier(specifier)) {
          imports.get(source).add(specifier.local.name);
        }
      });
    },
    ExportNamedDeclaration(path) {
      if (path.node.declaration) {
        if (t.isFunctionDeclaration(path.node.declaration)) {
          exports.set(path.node.declaration.id.name, filePath);
        } else if (t.isVariableDeclaration(path.node.declaration)) {
          path.node.declaration.declarations.forEach((decl) => {
            if (t.isIdentifier(decl.id)) {
              exports.set(decl.id.name, filePath);
            }
          });
        }
      }
      path.node.specifiers.forEach((specifier) => {
        if (t.isExportSpecifier(specifier)) {
          exports.set(specifier.local.name, filePath);
        }
      });
    },
    Identifier(path) {
      if (path.isReferencedIdentifier()) {
        usedIdentifiers.add(path.node.name);
      }
    },
  });
}

// Find all source files
function findSourceFiles() {
  const patterns = config.fileExtensions.map((ext) => `**/*${ext}`);
  const files = [];
  patterns.forEach((pattern) => {
    const matches = glob.sync(pattern, {
      cwd: config.sourceDir,
      ignore: config.excludePatterns,
    });
    files.push(...matches.map((file) => path.join(config.sourceDir, file)));
  });
  return files;
}

// Find unused exports
function findUnusedExports() {
  const unused = [];
  exports.forEach((filePath, name) => {
    if (!usedIdentifiers.has(name)) {
      unused.push({
        name,
        file: filePath,
      });
    }
  });
  return unused;
}

// Find unused imports
function findUnusedImports() {
  const unused = [];
  imports.forEach((importedNames, source) => {
    importedNames.forEach((name) => {
      if (!usedIdentifiers.has(name)) {
        unused.push({
          name,
          source,
        });
      }
    });
  });
  return unused;
}

// Remove unused code
function removeUnusedCode(filePath, unusedExports, unusedImports) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ast = parse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  const unusedInFile = unusedExports.filter((u) => u.file === filePath);
  const unusedImportsInFile = unusedImports.filter((u) => {
    const relativePath = path.relative(path.dirname(filePath), u.source);
    return relativePath.startsWith('.');
  });

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      const unused = unusedImportsInFile.filter((u) => u.source === source);
      if (unused.length > 0) {
        path.node.specifiers = path.node.specifiers.filter(
          (specifier) =>
            !unused.some((u) => u.name === specifier.local.name)
        );
        if (path.node.specifiers.length === 0) {
          path.remove();
        }
      }
    },
    ExportNamedDeclaration(path) {
      const unused = unusedInFile.filter(
        (u) => u.name === path.node.declaration?.id?.name
      );
      if (unused.length > 0) {
        path.remove();
      }
    },
  });

  // Write modified content back to file
  const output = require('@babel/generator').default(ast, {
    retainLines: true,
  }).code;
  fs.writeFileSync(filePath, output);
}

// Main function
async function cleanupUnusedCode() {
  console.log('Starting code cleanup...');

  // Find all source files
  const files = findSourceFiles();
  console.log(`Found ${files.length} source files`);

  // Parse all files
  files.forEach(parseFile);
  console.log('Parsed all files');

  // Find unused code
  const unusedExports = findUnusedExports();
  const unusedImports = findUnusedImports();
  console.log(`Found ${unusedExports.length} unused exports`);
  console.log(`Found ${unusedImports.length} unused imports`);

  // Remove unused code
  files.forEach((file) => {
    removeUnusedCode(file, unusedExports, unusedImports);
  });
  console.log('Removed unused code');

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    filesProcessed: files.length,
    unusedExports,
    unusedImports,
  };

  fs.writeFileSync(
    path.join(__dirname, '../reports/unused-code-report.json'),
    JSON.stringify(report, null, 2)
  );
  console.log('Generated cleanup report');

  console.log('Code cleanup completed');
}

// Run cleanup
cleanupUnusedCode().catch((error) => {
  console.error('Error during code cleanup:', error);
  process.exit(1);
}); 