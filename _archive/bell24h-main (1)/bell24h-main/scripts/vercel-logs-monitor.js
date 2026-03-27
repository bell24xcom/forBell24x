// ===============================================
// 2. VERCEL LOGS MONITORING FOR 404 ERRORS
// ===============================================
// File: scripts/vercel-logs-monitor.js
const { execSync } = require('child_process')
const fs = require('fs')

class VercelLogsMonitor {
  constructor() {
    this.logPatterns = {
      '404_errors': /GET \/[^\s]+ - 404/g,
      'category_404': /GET \/categories\/[^\s]+ - 404/g,
      'server_errors': /- 5\d{2}/g,
      'slow_responses': /- \d{3} \d{4,}ms/g
    }
  }

  async checkRecentLogs() {
    console.log('📊 CHECKING VERCEL LOGS FOR ERRORS...')
    
    try {
      // Get recent logs from Vercel
      const logs = execSync('vercel logs --output json --limit 1000', { 
        encoding: 'utf8',
        cwd: process.cwd()
      })
      
      const logEntries = logs.split('\n').filter(line => line.trim())
      const analysis = {
        total_requests: logEntries.length,
        errors_404: [],
        category_404s: [],
        server_errors: [],
        slow_responses: [],
        timestamp: new Date().toISOString()
      }
      
      // Analyze each log entry
      logEntries.forEach(logLine => {
        try {
          const logData = JSON.parse(logLine)
          const message = logData.message || ''
          
          // Check for 404 errors
          if (message.includes(' - 404')) {
            analysis.errors_404.push({
              timestamp: logData.timestamp,
              message: message,
              url: this.extractUrlFromLog(message)
            })
            
            // Check specifically for category 404s
            if (message.includes('/categories/')) {
              analysis.category_404s.push({
                timestamp: logData.timestamp,
                message: message,
                url: this.extractUrlFromLog(message)
              })
            }
          }
          
          // Check for server errors (5xx)
          if (message.match(/- 5\d{2}/)) {
            analysis.server_errors.push({
              timestamp: logData.timestamp,
              message: message
            })
          }
          
          // Check for slow responses (>2000ms)
          const slowMatch = message.match(/- \d{3} (\d+)ms/)
          if (slowMatch && parseInt(slowMatch[1]) > 2000) {
            analysis.slow_responses.push({
              timestamp: logData.timestamp,
              message: message,
              responseTime: slowMatch[1]
            })
          }
          
        } catch (parseError) {
          // Skip malformed log entries
        }
      })
      
      // Generate log analysis report
      this.generateLogReport(analysis)
      return analysis
      
    } catch (error) {
      console.error('❌ Failed to fetch Vercel logs:', error.message)
      console.log('💡 Make sure you have Vercel CLI installed and are logged in:')
      console.log('   npm i -g vercel')
      console.log('   vercel login')
      return null
    }
  }

  extractUrlFromLog(message) {
    const urlMatch = message.match(/GET (\/[^\s]+)/)
    return urlMatch ? urlMatch[1] : 'Unknown'
  }

  generateLogReport(analysis) {
    const report = `
# VERCEL LOGS ANALYSIS REPORT
Generated: ${analysis.timestamp}

## SUMMARY
- Total Requests Analyzed: ${analysis.total_requests}
- 404 Errors: ${analysis.errors_404.length}
- Category 404s: ${analysis.category_404s.length}
- Server Errors: ${analysis.server_errors.length}
- Slow Responses: ${analysis.slow_responses.length}

## CATEGORY 404 ERRORS (CRITICAL)
${analysis.category_404s.map(error => `
- Time: ${error.timestamp}
- URL: ${error.url}
- Log: ${error.message}
`).join('')}

## ALL 404 ERRORS
${analysis.errors_404.slice(0, 20).map(error => `
- Time: ${error.timestamp}
- URL: ${error.url}
`).join('')}
${analysis.errors_404.length > 20 ? `\n... and ${analysis.errors_404.length - 20} more` : ''}

## SERVER ERRORS (5XX)
${analysis.server_errors.map(error => `
- Time: ${error.timestamp}
- Log: ${error.message}
`).join('')}

## SLOW RESPONSES (>2000ms)
${analysis.slow_responses.slice(0, 10).map(error => `
- Time: ${error.timestamp}
- Response Time: ${error.responseTime}ms
- Log: ${error.message}
`).join('')}

## RECOMMENDATIONS
${this.generateLogRecommendations(analysis)}
`

    fs.writeFileSync('vercel-logs-analysis.md', report)
    console.log('📄 Vercel logs analysis saved to: vercel-logs-analysis.md')
    
    // Alert for critical issues
    if (analysis.category_404s.length > 0) {
      console.log(`🚨 CRITICAL: ${analysis.category_404s.length} category 404 errors found!`)
    }
    if (analysis.server_errors.length > 0) {
      console.log(`🚨 CRITICAL: ${analysis.server_errors.length} server errors found!`)
    }
  }

  generateLogRecommendations(analysis) {
    const recommendations = []
    
    if (analysis.category_404s.length > 0) {
      recommendations.push('🚨 IMMEDIATE: Fix category 404 errors - these are breaking your marketplace')
    }
    
    if (analysis.errors_404.length > 10) {
      recommendations.push('🔍 INVESTIGATE: High number of 404 errors - check for broken links')
    }
    
    if (analysis.server_errors.length > 0) {
      recommendations.push('⚡ URGENT: Server errors detected - check application code and database')
    }
    
    if (analysis.slow_responses.length > 5) {
      recommendations.push('🐌 OPTIMIZE: Slow responses detected - improve page performance')
    }
    
    return recommendations.join('\n')
  }
}

// Export for use
module.exports = { VercelLogsMonitor }

// If run directly, execute logs analysis
if (require.main === module) {
  const monitor = new VercelLogsMonitor()
  monitor.checkRecentLogs()
} 