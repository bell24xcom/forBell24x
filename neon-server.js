/**
 * Bell24H Neon PostgreSQL Integration Server
 * 
 * This server provides a REST API for interacting with your Neon PostgreSQL database.
 * It demonstrates how to integrate Neon with your existing Bell24H application.
 */

require('dotenv').config();
const http = require('http');
const url = require('url');
const { neon } = require('@neondatabase/serverless');

// Validate environment variable
if (!process.env.DATABASE_URL) {
  console.error('\x1b[31mERROR: DATABASE_URL is not set in your .env file\x1b[0m');
  console.log('Please create a .env file with your Neon database connection string:');
  console.log('DATABASE_URL=postgres://user:password@hostname/database');
  process.exit(1);
}

// Create SQL query function with prepared statements for security
const sql = neon(process.env.DATABASE_URL);

// Simple response helper
function sendResponse(res, statusCode, data, contentType = 'application/json') {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  
  if (contentType === 'application/json') {
    res.end(JSON.stringify(data));
  } else {
    res.end(data);
  }
}

// Route handlers
const routes = {
  // Health check endpoint
  '/health': async (req, res) => {
    try {
      const result = await sql`SELECT version()`;
      sendResponse(res, 200, { 
        status: 'ok', 
        postgres: result[0].version,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Database error:', err);
      sendResponse(res, 500, { status: 'error', message: 'Database connection failed' });
    }
  },
  
  // Get database stats
  '/stats': async (req, res) => {
    try {
      const dbSize = await sql`SELECT pg_size_pretty(pg_database_size(current_database())) as size`;
      const tableCount = await sql`
        SELECT count(*) as count FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      sendResponse(res, 200, {
        databaseSize: dbSize[0].size,
        tableCount: parseInt(tableCount[0].count),
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      sendResponse(res, 500, { status: 'error', message: 'Failed to fetch database stats' });
    }
  },
  
  // List tables
  '/tables': async (req, res) => {
    try {
      const tables = await sql`
        SELECT 
          table_name, 
          (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM 
          information_schema.tables t
        WHERE 
          table_schema = 'public'
        ORDER BY 
          table_name
      `;
      
      sendResponse(res, 200, { tables });
    } catch (err) {
      console.error('Error listing tables:', err);
      sendResponse(res, 500, { status: 'error', message: 'Failed to list tables' });
    }
  },
  
  // Get table schema
  '/tables/:name': async (req, res, params) => {
    try {
      const tableName = params.name;
      
      // Validate table name to prevent SQL injection
      if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return sendResponse(res, 400, { status: 'error', message: 'Invalid table name' });
      }
      
      // Get columns
      const columns = await sql`
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default
        FROM 
          information_schema.columns
        WHERE 
          table_name = ${tableName}
        ORDER BY 
          ordinal_position
      `;
      
      if (columns.length === 0) {
        return sendResponse(res, 404, { status: 'error', message: 'Table not found' });
      }
      
      sendResponse(res, 200, { table: tableName, columns });
    } catch (err) {
      console.error('Error getting table schema:', err);
      sendResponse(res, 500, { status: 'error', message: 'Failed to get table schema' });
    }
  },
  
  // Sample RFQ count endpoint (Bell24H specific)
  '/rfq/count': async (req, res) => {
    try {
      // This assumes you have an 'rfqs' table in your database
      // Modify the table name to match your actual schema
      const result = await sql`
        SELECT COUNT(*) as count FROM rfqs
      `.catch(err => {
        // Handle case where table doesn't exist
        if (err.message.includes('does not exist')) {
          return [{ count: 0 }];
        }
        throw err;
      });
      
      sendResponse(res, 200, { 
        count: parseInt(result[0].count),
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error counting RFQs:', err);
      sendResponse(res, 500, { status: 'error', message: 'Failed to count RFQs' });
    }
  },
  
  // Sample supplier risk endpoint (Bell24H specific)
  '/supplier/:id/risk': async (req, res, params) => {
    try {
      const supplierId = params.id;
      
      // Validate ID
      if (!/^[0-9]+$/.test(supplierId)) {
        return sendResponse(res, 400, { status: 'error', message: 'Invalid supplier ID' });
      }
      
      // This assumes you have a 'suppliers' table with a risk_score column
      // Modify to match your actual schema
      const result = await sql`
        SELECT risk_score FROM suppliers WHERE id = ${supplierId}
      `.catch(err => {
        // Handle case where table doesn't exist
        if (err.message.includes('does not exist')) {
          return [];
        }
        throw err;
      });
      
      if (result.length === 0) {
        return sendResponse(res, 404, { status: 'error', message: 'Supplier not found' });
      }
      
      sendResponse(res, 200, { 
        supplierId,
        riskScore: result[0].risk_score,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error getting supplier risk:', err);
      sendResponse(res, 500, { status: 'error', message: 'Failed to get supplier risk' });
    }
  }
};

// Request handler
const requestHandler = async (req, res) => {
  // Parse URL and query parameters
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // CORS headers for API access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return sendResponse(res, 204, '');
  }
  
  // Check if route exists
  let handler = routes[pathname];
  let params = {};
  
  // Handle parameterized routes
  if (!handler) {
    // Check for routes with parameters
    const paramRoutes = Object.keys(routes).filter(route => route.includes(':'));
    
    for (const route of paramRoutes) {
      const routeParts = route.split('/');
      const pathParts = pathname.split('/');
      
      if (routeParts.length === pathParts.length) {
        let match = true;
        const extractedParams = {};
        
        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(':')) {
            // Extract parameter
            extractedParams[routeParts[i].substring(1)] = pathParts[i];
          } else if (routeParts[i] !== pathParts[i]) {
            match = false;
            break;
          }
        }
        
        if (match) {
          handler = routes[route];
          params = extractedParams;
          break;
        }
      }
    }
  }
  
  // Execute handler or return 404
  if (handler) {
    try {
      await handler(req, res, params);
    } catch (err) {
      console.error('Request handler error:', err);
      sendResponse(res, 500, { status: 'error', message: 'Internal server error' });
    }
  } else {
    sendResponse(res, 404, { status: 'error', message: 'Endpoint not found' });
  }
};

// Create and start server
const PORT = process.env.PORT || 3001;
const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`\x1b[32m✓ Bell24H Neon Integration Server running at http://localhost:${PORT}\x1b[0m`);
  console.log('\nAvailable endpoints:');
  console.log('  \x1b[36mGET /health\x1b[0m - Check database connection');
  console.log('  \x1b[36mGET /stats\x1b[0m - Get database statistics');
  console.log('  \x1b[36mGET /tables\x1b[0m - List all tables');
  console.log('  \x1b[36mGET /tables/:name\x1b[0m - Get table schema');
  console.log('  \x1b[36mGET /rfq/count\x1b[0m - Count RFQs (Bell24H specific)');
  console.log('  \x1b[36mGET /supplier/:id/risk\x1b[0m - Get supplier risk score (Bell24H specific)');
});
