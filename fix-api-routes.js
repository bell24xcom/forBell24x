import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all API route files
function findApiRoutes(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findApiRoutes(fullPath));
    } else if (item === 'route.ts' || item === 'route.js') {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fix a single route file
function fixRouteFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if dynamic export already exists
    if (content.includes('export const dynamic')) {
      console.log(`Skipping ${filePath} - already has dynamic export`);
      return;
    }
    
    // Add dynamic export after imports
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Find the last import statement
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].startsWith('const ') && lines[i].includes('= require(')) {
        insertIndex = i + 1;
      }
    }
    
    // Insert dynamic export
    lines.splice(insertIndex, 0, '');
    lines.splice(insertIndex + 1, 0, '// Force dynamic rendering');
    lines.splice(insertIndex + 2, 0, "export const dynamic = 'force-dynamic';");
    
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Main execution
const apiDir = path.join(__dirname, 'app', 'api');
const routeFiles = findApiRoutes(apiDir);

console.log(`Found ${routeFiles.length} API route files`);
routeFiles.forEach(fixRouteFile);
console.log('Done fixing API routes');
