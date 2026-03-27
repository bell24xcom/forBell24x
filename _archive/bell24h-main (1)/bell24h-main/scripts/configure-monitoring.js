#!/usr/bin/env node

/**
 * Bell24H Monitoring Configuration Script
 * 
 * This script helps configure monitoring thresholds and alerts
 * for the Bell24H marketplace admin system.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  header: (msg) => console.log(`\n📊 ${msg}`),
  section: (msg) => console.log(`\n📋 ${msg}`)
};

// Monitoring configuration
const monitoringConfig = {
  systemHealth: {},
  performance: {},
  businessMetrics: {},
  alerts: {},
  notifications: {},
  reporting: {}
};

// Question helper
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Configure system health monitoring
async function configureSystemHealth() {
  log.header('System Health Monitoring Configuration');
  
  log.info('Setting up system health thresholds...');
  
  const cpuThreshold = parseInt(await askQuestion('CPU usage warning threshold % (default: 80): ') || '80');
  const memoryThreshold = parseInt(await askQuestion('Memory usage warning threshold % (default: 85): ') || '85');
  const diskThreshold = parseInt(await askQuestion('Disk usage warning threshold % (default: 90): ') || '90');
  const responseTimeThreshold = parseInt(await askQuestion('API response time warning threshold ms (default: 2000): ') || '2000');
  const errorRateThreshold = parseFloat(await askQuestion('Error rate warning threshold % (default: 5.0): ') || '5.0');
  
  monitoringConfig.systemHealth = {
    cpuThreshold,
    memoryThreshold,
    diskThreshold,
    responseTimeThreshold,
    errorRateThreshold,
    checkInterval: 60, // seconds
    retentionPeriod: 24 // hours
  };
  
  log.success('System health monitoring configured successfully');
}

// Configure performance monitoring
async function configurePerformance() {
  log.header('Performance Monitoring Configuration');
  
  log.info('Setting up performance monitoring...');
  
  const slowQueryThreshold = parseInt(await askQuestion('Slow query threshold ms (default: 1000): ') || '1000');
  const concurrentUsersThreshold = parseInt(await askQuestion('Concurrent users warning threshold (default: 1000): ') || '1000');
  const databaseConnectionsThreshold = parseInt(await askQuestion('Database connections warning threshold (default: 80): ') || '80');
  const queueSizeThreshold = parseInt(await askQuestion('Queue size warning threshold (default: 100): ') || '100');
  
  monitoringConfig.performance = {
    slowQueryThreshold,
    concurrentUsersThreshold,
    databaseConnectionsThreshold,
    queueSizeThreshold,
    enableProfiling: true,
    enableTracing: true
  };
  
  log.success('Performance monitoring configured successfully');
}

// Configure business metrics monitoring
async function configureBusinessMetrics() {
  log.header('Business Metrics Monitoring Configuration');
  
  log.info('Setting up business metrics monitoring...');
  
  const dailyRevenueTarget = parseFloat(await askQuestion('Daily revenue target ₹ (default: 1000000): ') || '1000000');
  const userGrowthTarget = parseFloat(await askQuestion('Monthly user growth target % (default: 10.0): ') || '10.0');
  const rfqCompletionTarget = parseFloat(await askQuestion('RFQ completion rate target % (default: 85.0): ') || '85.0');
  const customerSatisfactionTarget = parseFloat(await askQuestion('Customer satisfaction target (1-10, default: 8.5): ') || '8.5');
  
  monitoringConfig.businessMetrics = {
    dailyRevenueTarget,
    userGrowthTarget,
    rfqCompletionTarget,
    customerSatisfactionTarget,
    enableRealTimeTracking: true,
    enablePredictiveAnalytics: true
  };
  
  log.success('Business metrics monitoring configured successfully');
}

// Configure alerts
async function configureAlerts() {
  log.header('Alert Configuration');
  
  log.info('Setting up alert system...');
  
  const criticalAlerts = (await askQuestion('Enable critical alerts? (y/n, default: y): ') || 'y').toLowerCase() === 'y';
  const warningAlerts = (await askQuestion('Enable warning alerts? (y/n, default: y): ') || 'y').toLowerCase() === 'y';
  const infoAlerts = (await askQuestion('Enable info alerts? (y/n, default: n): ') || 'n').toLowerCase() === 'y';
  const alertCooldown = parseInt(await askQuestion('Alert cooldown period minutes (default: 15): ') || '15');
  
  monitoringConfig.alerts = {
    criticalAlerts,
    warningAlerts,
    infoAlerts,
    alertCooldown,
    enableEscalation: true,
    maxEscalationLevel: 3
  };
  
  log.success('Alert configuration completed successfully');
}

// Configure notifications
async function configureNotifications() {
  log.header('Notification Configuration');
  
  log.info('Setting up notification channels...');
  
  const emailNotifications = (await askQuestion('Enable email notifications? (y/n, default: y): ') || 'y').toLowerCase() === 'y';
  const smsNotifications = (await askQuestion('Enable SMS notifications? (y/n, default: n): ') || 'n').toLowerCase() === 'y';
  const slackNotifications = (await askQuestion('Enable Slack notifications? (y/n, default: y): ') || 'y').toLowerCase() === 'y';
  const webhookNotifications = (await askQuestion('Enable webhook notifications? (y/n, default: n): ') || 'n').toLowerCase() === 'y';
  
  let adminEmail = '';
  let slackWebhook = '';
  let webhookUrl = '';
  
  if (emailNotifications) {
    adminEmail = await askQuestion('Admin email for notifications: ');
  }
  
  if (slackNotifications) {
    slackWebhook = await askQuestion('Slack webhook URL: ');
  }
  
  if (webhookNotifications) {
    webhookUrl = await askQuestion('Webhook URL: ');
  }
  
  monitoringConfig.notifications = {
    emailNotifications,
    smsNotifications,
    slackNotifications,
    webhookNotifications,
    adminEmail,
    slackWebhook,
    webhookUrl,
    notificationSchedule: {
      critical: 'immediate',
      warning: 'within_5_minutes',
      info: 'within_30_minutes'
    }
  };
  
  log.success('Notification configuration completed successfully');
}

// Configure reporting
async function configureReporting() {
  log.header('Reporting Configuration');
  
  log.info('Setting up automated reporting...');
  
  const dailyReports = (await askQuestion('Enable daily reports? (y/n, default: y): ') || 'y').toLowerCase() === 'y';
  const weeklyReports = (await askQuestion('Enable weekly reports? (y/n, default: y): ') || 'y').toLowerCase() === 'y';
  const monthlyReports = (await askQuestion('Enable monthly reports? (y/n, default: y): ') || 'y').toLowerCase() === 'y';
  const customReports = (await askQuestion('Enable custom reports? (y/n, default: y): ') || 'y').toLowerCase() === 'y';
  
  monitoringConfig.reporting = {
    dailyReports,
    weeklyReports,
    monthlyReports,
    customReports,
    reportFormat: 'pdf',
    includeCharts: true,
    includeRecommendations: true,
    autoExport: true
  };
  
  log.success('Reporting configuration completed successfully');
}

// Generate monitoring configuration file
function generateMonitoringConfig() {
  const configContent = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    monitoring: monitoringConfig,
    metadata: {
      description: 'Bell24H Marketplace Monitoring Configuration',
      environment: process.env.NODE_ENV || 'development',
      marketplace: 'Bell24H'
    }
  };
  
  return JSON.stringify(configContent, null, 2);
}

// Generate environment variables for monitoring
function generateMonitoringEnv() {
  const envContent = `# Bell24H Monitoring Configuration
# Generated on: ${new Date().toISOString()}

# System Health Thresholds
MONITORING_CPU_THRESHOLD=${monitoringConfig.systemHealth.cpuThreshold}
MONITORING_MEMORY_THRESHOLD=${monitoringConfig.systemHealth.memoryThreshold}
MONITORING_DISK_THRESHOLD=${monitoringConfig.systemHealth.diskThreshold}
MONITORING_RESPONSE_TIME_THRESHOLD=${monitoringConfig.systemHealth.responseTimeThreshold}
MONITORING_ERROR_RATE_THRESHOLD=${monitoringConfig.systemHealth.errorRateThreshold}
MONITORING_CHECK_INTERVAL=${monitoringConfig.systemHealth.checkInterval}
MONITORING_RETENTION_PERIOD=${monitoringConfig.systemHealth.retentionPeriod}

# Performance Thresholds
MONITORING_SLOW_QUERY_THRESHOLD=${monitoringConfig.performance.slowQueryThreshold}
MONITORING_CONCURRENT_USERS_THRESHOLD=${monitoringConfig.performance.concurrentUsersThreshold}
MONITORING_DB_CONNECTIONS_THRESHOLD=${monitoringConfig.performance.databaseConnectionsThreshold}
MONITORING_QUEUE_SIZE_THRESHOLD=${monitoringConfig.performance.queueSizeThreshold}
MONITORING_ENABLE_PROFILING=${monitoringConfig.performance.enableProfiling}
MONITORING_ENABLE_TRACING=${monitoringConfig.performance.enableTracing}

# Business Metrics Targets
MONITORING_DAILY_REVENUE_TARGET=${monitoringConfig.businessMetrics.dailyRevenueTarget}
MONITORING_USER_GROWTH_TARGET=${monitoringConfig.businessMetrics.userGrowthTarget}
MONITORING_RFQ_COMPLETION_TARGET=${monitoringConfig.businessMetrics.rfqCompletionTarget}
MONITORING_CUSTOMER_SATISFACTION_TARGET=${monitoringConfig.businessMetrics.customerSatisfactionTarget}
MONITORING_ENABLE_REALTIME_TRACKING=${monitoringConfig.businessMetrics.enableRealTimeTracking}
MONITORING_ENABLE_PREDICTIVE_ANALYTICS=${monitoringConfig.businessMetrics.enablePredictiveAnalytics}

# Alert Configuration
MONITORING_CRITICAL_ALERTS=${monitoringConfig.alerts.criticalAlerts}
MONITORING_WARNING_ALERTS=${monitoringConfig.alerts.warningAlerts}
MONITORING_INFO_ALERTS=${monitoringConfig.alerts.infoAlerts}
MONITORING_ALERT_COOLDOWN=${monitoringConfig.alerts.alertCooldown}
MONITORING_ENABLE_ESCALATION=${monitoringConfig.alerts.enableEscalation}
MONITORING_MAX_ESCALATION_LEVEL=${monitoringConfig.alerts.maxEscalationLevel}

# Notification Configuration
MONITORING_EMAIL_NOTIFICATIONS=${monitoringConfig.notifications.emailNotifications}
MONITORING_SMS_NOTIFICATIONS=${monitoringConfig.notifications.smsNotifications}
MONITORING_SLACK_NOTIFICATIONS=${monitoringConfig.notifications.slackNotifications}
MONITORING_WEBHOOK_NOTIFICATIONS=${monitoringConfig.notifications.webhookNotifications}
MONITORING_ADMIN_EMAIL=${monitoringConfig.notifications.adminEmail}
MONITORING_SLACK_WEBHOOK=${monitoringConfig.notifications.slackWebhook}
MONITORING_WEBHOOK_URL=${monitoringConfig.notifications.webhookUrl}

# Reporting Configuration
MONITORING_DAILY_REPORTS=${monitoringConfig.reporting.dailyReports}
MONITORING_WEEKLY_REPORTS=${monitoringConfig.reporting.weeklyReports}
MONITORING_MONTHLY_REPORTS=${monitoringConfig.reporting.monthlyReports}
MONITORING_CUSTOM_REPORTS=${monitoringConfig.reporting.customReports}
MONITORING_REPORT_FORMAT=${monitoringConfig.reporting.reportFormat}
MONITORING_INCLUDE_CHARTS=${monitoringConfig.reporting.includeCharts}
MONITORING_INCLUDE_RECOMMENDATIONS=${monitoringConfig.reporting.includeRecommendations}
MONITORING_AUTO_EXPORT=${monitoringConfig.reporting.autoExport}
`;

  return envContent;
}

// Save configuration
function saveConfiguration() {
  const configContent = generateMonitoringConfig();
  const configPath = path.join(process.cwd(), 'monitoring-config.json');
  
  fs.writeFileSync(configPath, configContent);
  log.success(`Monitoring configuration saved to ${configPath}`);
  
  const envContent = generateMonitoringEnv();
  const envPath = path.join(process.cwd(), '.env.monitoring');
  
  fs.writeFileSync(envPath, envContent);
  log.success(`Monitoring environment variables saved to ${envPath}`);
}

// Main configuration function
async function configureMonitoring() {
  log.header('Bell24H Monitoring Configuration');
  log.info('This script will help you configure monitoring thresholds and alerts for your Bell24H marketplace.');
  
  try {
    await configureSystemHealth();
    await configurePerformance();
    await configureBusinessMetrics();
    await configureAlerts();
    await configureNotifications();
    await configureReporting();
    
    saveConfiguration();
    
    log.header('Monitoring Configuration Complete!');
    log.success('Your monitoring settings have been configured successfully.');
    log.info('Next steps:');
    log.info('1. Review the generated monitoring-config.json file');
    log.info('2. Update your main .env file with monitoring variables');
    log.info('3. Restart your application');
    log.info('4. Test the monitoring dashboard');
    log.info('5. Verify alert notifications are working');
    
  } catch (error) {
    log.error(`Configuration failed: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run configuration if this script is executed directly
if (require.main === module) {
  configureMonitoring().catch(console.error);
}

module.exports = { configureMonitoring, monitoringConfig }; 