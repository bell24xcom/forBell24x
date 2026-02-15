#!/usr/bin/env node

/**
 * Simple Database Setup Script for Bell24h
 * This script provides instructions and basic setup without requiring PostgreSQL
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Bell24h Database Setup Guide\n');

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
  console.log('❌ .env.local not found. Please run: npm run env:setup');
  process.exit(1);
}

// Read environment variables
require('dotenv').config({ path: '.env.local' });

console.log('📋 Database Setup Instructions:\n');

console.log('1. Install PostgreSQL:');
console.log('   Ubuntu/Debian: sudo apt install postgresql postgresql-contrib');
console.log('   macOS: brew install postgresql');
console.log('   Windows: Download from https://www.postgresql.org/download/\n');

console.log('2. Start PostgreSQL:');
console.log('   Ubuntu/Debian: sudo systemctl start postgresql');
console.log('   macOS: brew services start postgresql');
console.log('   Windows: Start PostgreSQL service\n');

console.log('3. Create Database:');
console.log('   sudo -u postgres psql');
console.log('   CREATE DATABASE bell24h_db;');
console.log('   CREATE USER bell24h_user WITH PASSWORD \'your_password\';');
console.log('   GRANT ALL PRIVILEGES ON DATABASE bell24h_db TO bell24h_user;');
console.log('   \\q\n');

console.log('4. Update .env.local:');
console.log('   DATABASE_URL="postgresql://bell24h_user:your_password@localhost:5432/bell24h_db"\n');

console.log('5. Push Database Schema:');
console.log('   npx prisma db push\n');

console.log('6. Test Setup:');
console.log('   npm run test:setup\n');

// Check if DATABASE_URL is set
if (process.env.DATABASE_URL && process.env.DATABASE_URL !== 'postgresql://username:password@localhost:5432/bell24h_db') {
  console.log('✅ DATABASE_URL is configured');
  console.log('🔧 Next step: Run "npx prisma db push" to create the database schema');
} else {
  console.log('❌ DATABASE_URL needs to be configured in .env.local');
  console.log('   Current value:', process.env.DATABASE_URL || 'Not set');
}

console.log('\n📚 For detailed instructions, see: IMPLEMENTATION_GUIDE.md');
