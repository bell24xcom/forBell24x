#!/usr/bin/env node

/**
 * APPLY DESIGN SYSTEM TO ALL PAGES - COMPREHENSIVE SCRIPT
 * This script applies the solid color design system to all 75+ pages
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Design system mappings
const designSystemMappings = {
    // Layout classes
    'min-h-screen bg-gray-50': 'page-container',
    'container mx-auto px-4 py-8': 'page-content',
    'text-center mb-8': 'page-header',
    'text-3xl font-bold text-gray-900 mb-4': 'page-title',
    'text-xl text-gray-600': 'page-subtitle',
    
    // Card classes
    'bg-white p-6 rounded-lg shadow-md': 'card',
    'bg-white p-8 rounded-xl shadow-lg': 'card',
    'bg-white rounded-lg shadow-sm p-6': 'card',
    
    // Button classes
    'bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700': 'btn-primary',
    'bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700': 'btn-primary',
    'border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50': 'btn-outline',
    'border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50': 'btn-outline',
    'text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-100': 'btn-ghost',
    
    // Form classes
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent': 'form-input',
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent': 'form-input',
    'block text-sm font-medium text-gray-700 mb-2': 'form-label',
    
    // Feature card classes
    'bg-white p-6 rounded-lg shadow-md': 'feature-card',
    'w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4': 'feature-icon',
    'text-xl font-semibold': 'feature-title',
    'text-gray-600 mb-4': 'feature-description',
    
    // Badge classes
    'px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full': 'badge-success',
    'px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full': 'badge-warning',
    'px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full': 'badge-error',
    'px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full': 'badge-info',
    'px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full': 'badge-info'
};

// Page-specific templates
const pageTemplates = {
    'dashboard': {
        wrapper: 'page-container',
        content: 'page-content',
        header: 'page-header',
        title: 'page-title',
        subtitle: 'page-subtitle'
    },
    'auth': {
        wrapper: 'min-h-screen bg-gray-50 flex items-center justify-center',
        content: 'max-w-md w-full',
        card: 'card'
    },
    'admin': {
        wrapper: 'page-container',
        content: 'page-content',
        header: 'page-header',
        title: 'page-title',
        subtitle: 'page-subtitle'
    },
    'rfq': {
        wrapper: 'page-container',
        content: 'page-content',
        header: 'page-header',
        title: 'page-title',
        subtitle: 'page-subtitle'
    },
    'help': {
        wrapper: 'page-container',
        content: 'page-content',
        header: 'page-header',
        title: 'page-title',
        subtitle: 'page-subtitle'
    },
    'services': {
        wrapper: 'page-container',
        content: 'page-content',
        header: 'page-header',
        title: 'page-title',
        subtitle: 'page-subtitle'
    }
};

function getPageType(filePath) {
    if (filePath.includes('/dashboard/')) return 'dashboard';
    if (filePath.includes('/auth/') || filePath.includes('/login') || filePath.includes('/register')) return 'auth';
    if (filePath.includes('/admin/')) return 'admin';
    if (filePath.includes('/rfq/')) return 'rfq';
    if (filePath.includes('/help/')) return 'help';
    if (filePath.includes('/services/')) return 'services';
    return 'default';
}

function applyDesignSystem(content, filePath) {
    let updatedContent = content;
    const pageType = getPageType(filePath);
    
    // Apply design system mappings
    for (const [oldClass, newClass] of Object.entries(designSystemMappings)) {
        const regex = new RegExp(oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        updatedContent = updatedContent.replace(regex, newClass);
    }
    
    // Apply page-specific templates
    if (pageType !== 'default' && pageTemplates[pageType]) {
        const template = pageTemplates[pageType];
        
        // Update wrapper classes
        if (template.wrapper) {
            updatedContent = updatedContent.replace(
                /className="[^"]*min-h-screen[^"]*"/g,
                `className="${template.wrapper}"`
            );
        }
        
        // Update content classes
        if (template.content) {
            updatedContent = updatedContent.replace(
                /className="[^"]*container mx-auto[^"]*"/g,
                `className="${template.content}"`
            );
        }
        
        // Update header classes
        if (template.header) {
            updatedContent = updatedContent.replace(
                /className="[^"]*text-center mb-8[^"]*"/g,
                `className="${template.header}"`
            );
        }
        
        // Update title classes
        if (template.title) {
            updatedContent = updatedContent.replace(
                /className="[^"]*text-3xl font-bold[^"]*"/g,
                `className="${template.title}"`
            );
        }
        
        // Update subtitle classes
        if (template.subtitle) {
            updatedContent = updatedContent.replace(
                /className="[^"]*text-xl text-gray-600[^"]*"/g,
                `className="${template.subtitle}"`
            );
        }
    }
    
    // Remove gradient backgrounds
    updatedContent = updatedContent.replace(/bg-gradient-to-[^"]*/g, 'bg-gray-50');
    updatedContent = updatedContent.replace(/from-[^"]*via-[^"]*to-[^"]*/g, '');
    
    // Ensure solid colors only
    updatedContent = updatedContent.replace(/linear-gradient\([^)]*\)/g, '');
    
    return updatedContent;
}

function updatePageFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const updatedContent = applyDesignSystem(content, filePath);
        
        if (content !== updatedContent) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error updating ${filePath}: ${error.message}`, 'red');
        return false;
    }
}

function getAllPageFiles() {
    const pageFiles = [];
    
    function scanDirectory(dir) {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                scanDirectory(fullPath);
            } else if (item === 'page.tsx') {
                pageFiles.push(fullPath);
            }
        }
    }
    
    scanDirectory('app');
    return pageFiles;
}

async function main() {
    log('🎨 APPLYING DESIGN SYSTEM TO ALL PAGES', 'cyan');
    log('========================================', 'cyan');
    
    const pageFiles = getAllPageFiles();
    log(`📁 Found ${pageFiles.length} page files to update`, 'yellow');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const filePath of pageFiles) {
        const relativePath = filePath.replace(process.cwd() + path.sep, '');
        log(`\n🔄 Updating ${relativePath}...`, 'blue');
        
        try {
            const wasUpdated = updatePageFile(filePath);
            if (wasUpdated) {
                log(`✅ Updated ${relativePath}`, 'green');
                updatedCount++;
            } else {
                log(`⚪ No changes needed for ${relativePath}`, 'white');
            }
        } catch (error) {
            log(`❌ Error updating ${relativePath}: ${error.message}`, 'red');
            errorCount++;
        }
    }
    
    log('\n========================================', 'cyan');
    log('🎉 DESIGN SYSTEM APPLICATION COMPLETE!', 'green');
    log('========================================', 'cyan');
    
    log(`\n📊 Results:`, 'yellow');
    log(`   • Total pages processed: ${pageFiles.length}`, 'white');
    log(`   • Pages updated: ${updatedCount}`, 'green');
    log(`   • Pages unchanged: ${pageFiles.length - updatedCount - errorCount}`, 'white');
    log(`   • Errors: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
    
    if (updatedCount > 0) {
        log(`\n🚀 Next steps:`, 'cyan');
        log(`   1. Review the changes`, 'white');
        log(`   2. Test the updated pages`, 'white');
        log(`   3. Commit and deploy`, 'white');
    }
}

// Run the script
main().catch(error => {
    log(`❌ Script failed: ${error.message}`, 'red');
    process.exit(1);
});
