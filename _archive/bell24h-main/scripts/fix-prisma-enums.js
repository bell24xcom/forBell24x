#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enum replacement mappings
const enumReplacements = {
  // TransactionType replacements
  'TransactionType.DEPOSIT': '"DEPOSIT"',
  'TransactionType.WITHDRAWAL': '"WITHDRAWAL"',
  'TransactionType.TRANSFER': '"TRANSFER"',
  'TransactionType.ESCROW_HOLD': '"ESCROW_HOLD"',
  'TransactionType.ESCROW_RELEASE': '"ESCROW_RELEASE"',
  'TransactionType.ESCROW_REFUND': '"ESCROW_REFUND"',
  'TransactionType.RFQ_SUBMISSION': '"RFQ_SUBMISSION"',
  'TransactionType.SUPPLIER_MATCH': '"SUPPLIER_MATCH"',
  'TransactionType.PAYMENT': '"PAYMENT"',
  'TransactionType.REFUND': '"REFUND"',
  'TransactionType.PO_CREATION': '"PO_CREATION"',
  
  // TransactionStatus replacements
  'TransactionStatus.PENDING': '"PENDING"',
  'TransactionStatus.COMPLETED': '"COMPLETED"',
  'TransactionStatus.FAILED': '"FAILED"',
  'TransactionStatus.CANCELLED': '"CANCELLED"',
  'TransactionStatus.HELD_IN_ESCROW': '"HELD_IN_ESCROW"',
  'TransactionStatus.RELEASED': '"RELEASED"',
  'TransactionStatus.REFUNDED': '"REFUNDED"',
  'TransactionStatus.APPROVED': '"APPROVED"',
  'TransactionStatus.IN_PROGRESS': '"IN_PROGRESS"',
  'TransactionStatus.IN_REVIEW': '"IN_REVIEW"',
  'TransactionStatus.REJECTED': '"REJECTED"',
  'TransactionStatus.APPROVAL_PENDING': '"APPROVAL_PENDING"',
  'TransactionStatus.PROCESSING': '"PROCESSING"',
  'TransactionStatus.RETRYING': '"RETRYING"',
  
  // UserRole replacements
  'UserRole.BUYER': '"BUYER"',
  'UserRole.SUPPLIER': '"SUPPLIER"',
  'UserRole.ADMIN': '"ADMIN"',
  
  // RFQStatus replacements
  'RFQStatus.DRAFT': '"DRAFT"',
  'RFQStatus.PUBLISHED': '"PUBLISHED"',
  'RFQStatus.CLOSED': '"CLOSED"',
  'RFQStatus.AWARDED': '"AWARDED"',
  'RFQStatus.CANCELLED': '"CANCELLED"',
  'RFQStatus.OPEN': '"OPEN"',
  
  // EscrowStatus replacements
  'EscrowStatus.PENDING': '"PENDING"',
  'EscrowStatus.FUNDED': '"FUNDED"',
  'EscrowStatus.RELEASED': '"RELEASED"',
  'EscrowStatus.REFUNDED': '"REFUNDED"',
  'EscrowStatus.DISPUTED': '"DISPUTED"'
};

// Import statement replacements
const importReplacements = {
  'import { TransactionType, TransactionStatus, UserRole, RFQStatus, EscrowStatus } from \'@prisma/client\'': '',
  'import { TransactionType, TransactionStatus } from \'@prisma/client\'': '',
  'import { UserRole } from \'@prisma/client\'': '',
  'import { RFQStatus } from \'@prisma/client\'': '',
  'import { EscrowStatus } from \'@prisma/client\'': '',
  'import { TransactionType } from \'@prisma/client\'': '',
  'import { TransactionStatus } from \'@prisma/client\'': ''
};

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace enum usages
    for (const [enumUsage, replacement] of Object.entries(enumReplacements)) {
      if (content.includes(enumUsage)) {
        content = content.replace(new RegExp(enumUsage.replace(/\./g, '\\.'), 'g'), replacement);
        modified = true;
      }
    }
    
    // Replace import statements
    for (const [importStmt, replacement] of Object.entries(importReplacements)) {
      if (content.includes(importStmt)) {
        content = content.replace(importStmt, replacement);
        modified = true;
      }
    }
    
    // Clean up empty import lines
    content = content.replace(/import\s*{\s*}\s*from\s*['"]@prisma\/client['"];?\s*\n?/g, '');
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let updatedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next' && file !== 'dist') {
        updatedCount += walkDirectory(filePath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      if (processFile(filePath)) {
        updatedCount++;
      }
    }
  }
  
  return updatedCount;
}

// Start processing from the client directory
const clientDir = path.resolve(__dirname, '../client');
console.log('🔧 Starting Prisma enum replacement...');
console.log(`📁 Processing directory: ${clientDir}`);

const updatedFiles = walkDirectory(clientDir);
console.log(`\n✅ Completed! Updated ${updatedFiles} files.`); 