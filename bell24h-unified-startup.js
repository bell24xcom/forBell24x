/**
 * Bell24h Unified Application Startup Script
 * 
 * This script provides a robust way to start the Bell24h application,
 * handling different execution modes and environment configurations.
 * 
 * Features:
 * - Automatically selects the optimal execution method (tsx for development, node for production)
 * - Properly logs output and errors
 * - Handles graceful shutdown
 * - Environment detection
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Terminal colors for better logging
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Configuration
const config = {
  serverPort: process.env.PORT || 5000,
  environment: process.env.NODE_ENV || 'development',
  serverPath: path.join(__dirname, 'server/index.ts'),
  compiledServerPath: path.join(__dirname, 'server/index.js'),
  logToDisk: true,
  logPath: path.join(__dirname, 'logs')
};

// Create logs directory if it doesn't exist
if (config.logToDisk && !fs.existsSync(config.logPath)) {
  fs.mkdirSync(config.logPath, { recursive: true });
}

// Log with timestamp and color
function log(message, color = colors.reset) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `${colors.bright}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`;
  console.log(formattedMessage);
  
  if (config.logToDisk) {
    const logFile = path.join(config.logPath, 'server.log');
    fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
  }
}

// Check if TypeScript, tsx, and node modules are available
function checkEnvironment() {
  try {
    // Check for tsx
    const tsxAvailable = fs.existsSync(path.join(__dirname, 'node_modules', 'tsx'));
    // Check for TypeScript files
    const tsFilesExist = fs.existsSync(config.serverPath);
    // Check for compiled JS files
    const jsFilesExist = fs.existsSync(config.compiledServerPath);
    
    return {
      tsxAvailable,
      tsFilesExist,
      jsFilesExist
    };
  } catch (error) {
    log(`Error checking environment: ${error.message}`, colors.red);
    return {
      tsxAvailable: false,
      tsFilesExist: false,
      jsFilesExist: false
    };
  }
}

// Get the appropriate start command based on the environment
function getStartCommand() {
  const env = checkEnvironment();
  
  // Development mode with TypeScript
  if (config.environment === 'development' && env.tsxAvailable && env.tsFilesExist) {
    return {
      command: 'npx',
      args: ['tsx', 'server/index.ts']
    };
  }
  
  // Production mode with compiled JavaScript
  if (env.jsFilesExist) {
    return {
      command: 'node',
      args: ['server/index.js']
    };
  }
  
  // Fallback to compiling TypeScript and running the result
  if (env.tsFilesExist) {
    try {
      log('Compiling TypeScript...', colors.yellow);
      execSync('npx tsc', { stdio: 'inherit' });
      return {
        command: 'node',
        args: ['server/index.js']
      };
    } catch (error) {
      log(`Failed to compile TypeScript: ${error.message}`, colors.red);
      throw new Error('Failed to compile TypeScript');
    }
  }
  
  throw new Error('No valid start method found. Ensure server files exist.');
}

// Start the server
function startServer() {
  log(`Starting Bell24h application in ${config.environment} mode...`, colors.cyan);
  
  try {
    const { command, args } = getStartCommand();
    
    log(`Executing: ${command} ${args.join(' ')}`, colors.blue);
    
    const server = spawn(command, args, {
      stdio: 'inherit',
      env: { ...process.env, PORT: config.serverPort }
    });
    
    // Handle server events
    server.on('error', (error) => {
      log(`Server error: ${error.message}`, colors.red);
    });
    
    server.on('close', (code) => {
      if (code !== 0) {
        log(`Server process exited with code ${code}`, colors.red);
      } else {
        log('Server process closed', colors.yellow);
      }
    });
    
    // Handle process termination signals
    process.on('SIGINT', () => {
      log('Received SIGINT. Gracefully shutting down...', colors.yellow);
      server.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      log('Received SIGTERM. Gracefully shutting down...', colors.yellow);
      server.kill('SIGTERM');
      process.exit(0);
    });
    
    // Save the server process ID to a file for external management
    fs.writeFileSync(path.join(__dirname, 'server.pid'), server.pid.toString());
    
    log(`Server started on port ${config.serverPort}`, colors.green);
    log(`Application is running at http://localhost:${config.serverPort}`, colors.green);
  } catch (error) {
    log(`Failed to start server: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Execute the startup sequence
startServer();
