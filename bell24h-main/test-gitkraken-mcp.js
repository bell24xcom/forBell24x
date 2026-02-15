#!/usr/bin/env node

/**
 * Test script for GitKraken MCP Server
 */

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");

console.log("🔧 Testing GitKraken MCP Server Setup...");
console.log("=====================================");

// Check if MCP SDK is installed
try {
  require("@modelcontextprotocol/sdk");
  console.log("✅ MCP SDK is installed");
} catch (error) {
  console.log("❌ MCP SDK is not installed");
  console.log("   Run: npm install @modelcontextprotocol/sdk");
  process.exit(1);
}

// Check if configuration files exist
const fs = require('fs');
const path = require('path');

const configFiles = [
  'gitkraken-mcp-server.js',
  'mcp-gitkraken.json',
  'gitkraken.env'
];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} is missing`);
  }
});

// Check environment variables
require('dotenv').config({ path: 'gitkraken.env' });
const gitkrakenToken = process.env.GITKRAKEN_API_TOKEN;

if (gitkrakenToken && gitkrakenToken !== 'your_gitkraken_token_here') {
  console.log("✅ GitKraken API token is configured");
} else {
  console.log("⚠️  GitKraken API token needs to be set in gitkraken.env");
  console.log("   Get your token from: https://app.gitkraken.com/user-profile/tokens");
}

// Test Git connectivity
try {
  const { execSync } = require('child_process');
  execSync('git --version', { stdio: 'pipe' });
  console.log("✅ Git is installed and working");
} catch (error) {
  console.log("❌ Git is not installed or not in PATH");
}

console.log("");
console.log("🎯 Setup Summary:");
console.log("================");

if (gitkrakenToken === 'your_gitkraken_token_here') {
  console.log("⚠️  NEXT STEPS:");
  console.log("1. Get GitKraken API token from https://app.gitkraken.com/user-profile/tokens");
  console.log("2. Update GITKRAKEN_API_TOKEN in gitkraken.env");
  console.log("3. Restart Cursor to load the MCP server");
  console.log("4. Test with: node gitkraken-mcp-server.js");
} else {
  console.log("✅ Setup appears complete!");
  console.log("1. Restart Cursor to load the MCP server");
  console.log("2. Test with: node gitkraken-mcp-server.js");
}

console.log("");
console.log("📚 Available MCP Tools:");
console.log("- git_status: Check repository status");
console.log("- git_log: View commit history");
console.log("- git_diff: Show file differences");
console.log("- git_branch: List branches");
console.log("- git_commit: Create commits");
console.log("");
console.log("🚀 Ready to use GitKraken MCP with Cursor!");
