// scripts/health-check.js - Post-deployment health check
const https = require('https');

const healthCheck = async (url) => {
  try {
    const response = await fetch(`${url}/api/health`);
    const data = await response.json();

    console.log('🏥 Health Check Results:');
    console.log(`Status: ${data.status}`);
    console.log(`Uptime: ${data.uptime}s`);
    console.log(`Response Time: ${data.responseTime}ms`);

    console.log('\n📊 Services Status:');
    Object.entries(data.services).forEach(([service, status]) => {
      const icon = status.status === 'healthy' ? '✅' :
        status.status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${service}: ${status.status} - ${status.message}`);
    });

    return data.status === 'healthy';
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
};

// Run health check
const url = process.argv[2] || 'https://your-app.vercel.app';
healthCheck(url).then(success => {
  process.exit(success ? 0 : 1);
});
