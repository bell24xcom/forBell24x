# PowerShell script to fix missing Lucide React icon imports in all .tsx files in src/, app/, and components/

$dirs = @("src", "app", "components")
$files = @()

foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        $files += Get-ChildItem -Path $dir -Recurse -Filter *.tsx | Select-Object -ExpandProperty FullName
    }
}

foreach ($file in $files) {
    Write-Host "Processing $file"
    node -e @"
const fs = require('fs');
const path = process.argv[1];
let content = fs.readFileSync(path, 'utf8');

// Find all JSX tags that look like Lucide icons (start with uppercase, no import)
const usedIcons = Array.from(content.matchAll(/<([A-Z][a-zA-Z0-9]+)[\s/>]/g)).map(m => m[1]);
const importLine = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
let importedIcons = [];
if (importLine) {
    importedIcons = importLine[1].split(',').map(s => s.trim());
}
const missingIcons = usedIcons.filter(icon => !importedIcons.includes(icon));

// Only add import if there are missing icons
if (missingIcons.length > 0) {
    const newImport = 'import { ' + missingIcons.join(', ') + ' } from \"lucide-react\";\\n';
    let newContent = content;
    if (importLine) {
        // Add missing icons to existing import
        const fullImport = importLine[0];
        const allIcons = Array.from(new Set([...importedIcons, ...missingIcons]));
        const updatedImport = 'import { ' + allIcons.join(', ') + ' } from \"lucide-react\";';
        newContent = content.replace(fullImport, updatedImport);
    } else {
        // Insert new import after last import
        const lastImport = content.lastIndexOf('import');
        const nextLine = content.indexOf('\\n', lastImport) + 1;
        newContent = content.slice(0, nextLine) + newImport + content.slice(nextLine);
    }
    fs.writeFileSync(path, newContent);
    console.log('Updated imports in', path);
}
"@ $file
}
